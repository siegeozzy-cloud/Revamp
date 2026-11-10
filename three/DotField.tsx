"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { CAMERA } from "@/storyboard/world";
import { QUALITY } from "@/storyboard/timeline";
import type { QualityTier } from "./state";

/**
 * Pointer-reactive dot field, sitting behind the board as the backdrop.
 *
 * A grid of points displaced by a radial wave centred on the cursor. The
 * displacement runs in a vertex shader rather than on the CPU: at ~3,800
 * points, rewriting instance matrices every frame would cost more than
 * the rest of the scene combined, while a shader does it in one draw call
 * for effectively nothing.
 *
 * The field tracks the camera down the tunnel, so it is always the same
 * distance behind the action, and it does NOT track the camera's lateral
 * drift — that gives the backdrop parallax against the rings for free.
 */

const DISTANCE = 190;
/** Keep rippling for this long after the pointer stops, then settle. */
const SETTLE_MS = 2600;

const VERT = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uAmp;
  uniform float uSize;
  varying float vLift;

  void main() {
    vec3 p = position;

    float d = distance(p.xy, uPointer);
    // Travelling ring that decays with distance from the cursor.
    float wave = sin(d * 0.13 - uTime * 2.4) * exp(-d * 0.0075);

    /*
      Standing pattern, so the field reads as flowing bands even when
      nothing is happening. Deliberately NOT animated by uTime: the canvas
      runs frameloop="demand", and a field that breathes on its own would
      force a full scene render every frame forever — which is what pinned
      the GPU last time. Spatial only, so it costs nothing at rest.
    */
    float bands =
      sin(p.x * 0.045 + sin(p.y * 0.021) * 2.2) * 0.5 +
      sin(p.y * 0.038 - sin(p.x * 0.017) * 1.8) * 0.5;

    /*
      The standing pattern shapes the SURFACE; only the pointer wave
      changes how bright a dot is. Letting the bands drive opacity too
      left half the field in a trough at near-zero alpha, which is why
      the grid kept disappearing into the background.
    */
    p.z += (wave + bands * 0.34) * uAmp;
    vLift = max(wave, 0.0);

    // Gentle barrel, so this reads as a curved surface rather than a wall.
    p.z += dot(p.xy, p.xy) * 0.00055;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (1.0 + vLift * 2.0) * (260.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

/*
  No `discard` here any more.

  It looked like an optimization and was the opposite. This draw is
  additively blended with depthWrite off, so a fragment with alpha 0
  already contributes nothing — discard saved no work. What it DID do is
  mark the shader as having side effects, which disables early-Z and
  hidden-surface removal for the draw on exactly the tile-based GPUs every
  phone uses (Apple, Adreno, Mali). The field covers the entire frame and
  sits behind the board, so losing early rejection there also costs the
  expensive ring shaders drawn over it.
*/
const FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vLift;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float a = smoothstep(0.5, 0.18, length(c));
    // Every dot sits at half opacity; the wave lifts it to full.
    gl_FragColor = vec4(uColor * (1.3 + vLift * 1.7), a * uOpacity * (0.5 + vLift * 0.5));
  }
`;

export function DotField({ tier = "high" }: { tier?: QualityTier }) {
  const { camera, invalidate, size } = useThree();
  const q = QUALITY[tier];
  /*
    Grid pitch is the expensive dial here, not brightness: the field is
    fill-rate bound and draws additively across the whole frame. Point
    count goes as the SQUARE of this, so the low tier's 7.6 against the
    desktop 3.9 is ~3.8x fewer points — on a 390pt portrait phone that is
    ~640 points instead of ~2,430, each one covering 8-24 device pixels of
    blended fragment.
  */
  const spacing = q.fieldSpacing;
  // Bisect handle: load the page with ?nofield to drop this layer and see
  // whether a performance problem is coming from here or from the board.
  const off =
    !q.field ||
    (typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("nofield"));
  const points = useRef<THREE.Points>(null);
  const lastMove = useRef(-Infinity);
  const ndc = useRef(new THREE.Vector2(0, 0));

  const halfH = DISTANCE * Math.tan((CAMERA.fov / 2) * (Math.PI / 180));
  const halfW = halfH * Math.max(1.2, size.width / Math.max(size.height, 1));

  const geometry = useMemo(() => {
    const cols = Math.ceil((halfW * 2.4) / spacing);
    const rows = Math.ceil((halfH * 2.4) / spacing);
    const pos = new Float32Array(cols * rows * 3);
    let i = 0;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        pos[i++] = (x - (cols - 1) / 2) * spacing;
        pos[i++] = (y - (rows - 1) / 2) * spacing;
        pos[i++] = 0;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [halfW, halfH, spacing]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uPointer: { value: new THREE.Vector2(0, 0) },
          uAmp: { value: 9.0 },
          /*
            Grown with the square root of the pitch, not with the pitch.
            A sparser grid at the same dot size reads as a thinner, dimmer
            field rather than a lighter one, so each dot takes back some of
            the gap — but only half of it, so total coverage still falls
            (low tier: ~3.8x fewer dots, ~2x the area each, ~2x less fill).
          */
          uSize: { value: 2.9 * Math.sqrt(spacing / 3.9) },
          uColor: { value: new THREE.Color("#ffffff") },
          uOpacity: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [spacing],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useEffect(() => {
    /*
      Record the pointer, but only ASK for a frame when the ripple was
      idle. frameloop is "demand", so invalidate() schedules a full scene
      render — calling it per event meant a real mouse (≈120 events/sec)
      requested 120 full renders a second and pinned the GPU. Once the
      ripple is running, useFrame below keeps it alive on its own.
    */
    const kick = () => {
      const now = performance.now();
      const wasIdle = now - lastMove.current > SETTLE_MS;
      lastMove.current = now;
      if (wasIdle) invalidate();
    };
    const onMove = (e: PointerEvent) => {
      ndc.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      );
      kick();
    };
    const onLeave = () => kick();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [invalidate]);

  useFrame((state, dt) => {
    const mesh = points.current;
    if (!mesh || off) return;

    // Always the same distance behind the camera, never following its
    // lateral drift — that difference is what creates the parallax.
    mesh.position.set(0, 0, camera.position.z - DISTANCE);

    const u = material.uniforms;
    u.uTime.value += dt;
    u.uPointer.value.set(ndc.current.x * halfW, ndc.current.y * halfH);

    // Fade in on first sight, so the field does not pop.
    u.uOpacity.value = Math.min(1, u.uOpacity.value + dt * 0.9);
    // Keep asking for frames until the fade finishes. On the story page
    // the scroll driver happens to supply them; on a page where this is
    // the only animated thing, nothing else would, and the field would
    // stall out at invisible.
    if (u.uOpacity.value < 1) invalidate();

    // frameloop is "demand": keep asking for frames while the ripple is
    // still running, then let it stop so a parked page costs nothing.
    if (performance.now() - lastMove.current < SETTLE_MS) invalidate();
  });

  if (off) return null;

  return (
    <points
      ref={points}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      // Nothing here is clickable. Without this, R3F raycasts every point
      // on every pointer move.
      raycast={() => null}
    />
  );
}

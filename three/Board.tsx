"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  BULLSEYE_RADIUS,
  BULLSEYE_Z,
  RING_COUNT,
  RING_RADIUS,
  RING_RATIO,
  RING_Z,
} from "@/storyboard/world";
import {
  MAX_RING_THICKNESS,
  buildAnalytics,
  buildLayeredRing,
  buildLogoMark,
  buildRing,
  buildSpokes,
  ringThickness,
} from "./geometry";
import {
  PALETTE,
  layerMaterials,
  ringMaterial,
  signalPointMaterial,
  wireMaterial,
} from "./materials";
import { QUALITY } from "@/storyboard/timeline";
import type { StageState } from "./state";

const FIT_SEGMENTS = 5;

/**
 * The mark sits inside the bullseye rather than filling it. At full
 * bullseye radius the camera would have to stop further out than the
 * bullseye hold to frame it, which breaks the monotonic depth the whole
 * timeline depends on.
 */
const MARK_SCALE = 0.44;



/**
 * The board. Every value it animates comes from the shared StageState,
 * read inside useFrame — nothing here branches on state at render time,
 * so React renders this component once and never again.
 */
export function Board({ state }: { state: StageState }) {
  const q = QUALITY[state.quality];

  // ---- geometry, built once per quality tier -------------------------------
  const rings = useMemo(
    () => RING_RADIUS.map((r) => buildRing(r, q.ringSegments)),
    [q.ringSegments],
  );

  const layered = useMemo(
    () => buildLayeredRing(RING_RADIUS[1], q.ringSegments),
    [q.ringSegments],
  );

  const spokes = useMemo(
    () => buildSpokes(BULLSEYE_RADIUS, RING_RADIUS[0], 20, 0.34, q.tubeSegments),
    [q.tubeSegments],
  );

  /** The bullseye is the Centaim mark itself, not a disc. */
  const bullGeo = useMemo(
    () => buildLogoMark(BULLSEYE_RADIUS * MARK_SCALE, q.ringSegments),
    [q.ringSegments],
  );

  const analytics = useMemo(() => buildAnalytics(RING_RADIUS[3]), []);
  const barGeo = useMemo(() => {
    // Unit box anchored at its base, so scale.y grows upward.
    const g = new THREE.BoxGeometry(1, 1, 1);
    g.translate(0, 0.5, 0);
    return g;
  }, []);
  const trendGeo = useMemo(
    () => new THREE.TubeGeometry(analytics.trend, 120, RING_RADIUS[3] * 0.012, 6, false),
    [analytics],
  );
  const axisGeo = useMemo(() => {
    const w = RING_RADIUS[3] * RING_RATIO * 1.5;
    const g = new THREE.BoxGeometry(w, RING_RADIUS[3] * 0.008, RING_RADIUS[3] * 0.008);
    g.translate(0, -RING_RADIUS[3] * 0.34, 0);
    return g;
  }, []);

  const fitSegments = useMemo(() => {
    const radius = RING_RADIUS[2];
    const arc = (Math.PI * 2) / FIT_SEGMENTS;
    return Array.from(
      { length: FIT_SEGMENTS },
      (_, si) =>
        new THREE.RingGeometry(
          radius * 0.845,
          radius * 0.965,
          Math.max(8, Math.round(q.ringSegments / FIT_SEGMENTS)),
          1,
          si * arc + 0.035,
          arc - 0.07,
        ),
    );
  }, [q.ringSegments]);

  // ---- materials -----------------------------------------------------------
  /** One material per ring, so emissive can be driven individually. */
  const matRings = useMemo(() => RING_RADIUS.map(() => ringMaterial()), []);
  const matLayers = useMemo(() => layerMaterials(), []);
  const matPoints = useMemo(() => signalPointMaterial(), []);
  const matTrend = useMemo(() => signalPointMaterial(), []);
  const matAxis = useMemo(() => {
    const m = signalPointMaterial();
    m.color = new THREE.Color(PALETTE.gunmetalRim);
    return m;
  }, []);
  // Faded in and out as a group when the signal beat is active.
  useEffect(() => {
    [matPoints, matTrend, matAxis].forEach((m) => {
      m.transparent = true;
      m.opacity = 0;
    });
  }, [matPoints, matTrend, matAxis]);
  const matWire = useMemo(() => wireMaterial(), []);
  const matSegments = useMemo(
    () =>
      Array.from(
        { length: FIT_SEGMENTS },
        () =>
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(PALETTE.gunmetalDeep),
            emissive: new THREE.Color(PALETTE.aimLive),
            emissiveIntensity: 0,
            side: THREE.DoubleSide,
            toneMapped: false,
          }),
      ),
    [],
  );
  const matBull = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(PALETTE.aim),
        emissive: new THREE.Color(PALETTE.aimLive),
        emissiveIntensity: 0.15,
        side: THREE.DoubleSide,
        toneMapped: false,
        transparent: true,
      }),
    [],
  );

  useEffect(() => {
    const geos = [
      ...rings,
      ...layered,
      ...fitSegments,
      spokes,
      bullGeo,
      barGeo,
      trendGeo,
      axisGeo,
    ];
    const mats = [
      ...matRings,
      ...matLayers,
      ...matSegments,
      matPoints,
      matTrend,
      matAxis,
      matWire,
      matBull,
    ];
    return () => {
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
    };
  }, [
    rings,
    layered,
    fitSegments,
    spokes,
    bullGeo,
    barGeo,
    trendGeo,
    axisGeo,
    matRings,
    matLayers,
    matSegments,
    matPoints,
    matTrend,
    matAxis,
    matWire,
    matBull,
  ]);

  // ---- refs ----------------------------------------------------------------
  const ringRefs = useRef<(THREE.Group | null)[]>([]);
  const layerRefs = useRef<(THREE.Mesh | null)[]>([]);
  const apertureRef = useRef<THREE.Group>(null);
  const bullRef = useRef<THREE.Mesh>(null);
  const spokeRef = useRef<THREE.Mesh>(null);
  const barsRef = useRef<THREE.InstancedMesh>(null);
  const chartRef = useRef<THREE.Group>(null);
  const trendRef = useRef<THREE.Mesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const bullGlow = useRef(0.15);
  const segHold = useRef(0);

  useFrame((_, dt) => {
    const { telescope, active, clip, segments, resolve, aperture, flash } = state;
    const k = Math.min(1, dt * 9);

    // Rings slide from the flat plane out to their tunnel depths.
    for (let i = 0; i < RING_COUNT; i++) {
      const group = ringRefs.current[i];
      if (group) group.position.z = RING_Z[i] * telescope;

      // Live ring glows; everything else is structure.
      // A sheen, not a flood. The small inlays carry the actual glow.
      const target = active === i ? 0.3 : 0;
      const mat = matRings[i];
      mat.emissiveIntensity += (target - mat.emissiveIntensity) * k;
    }

    if (bullRef.current) {
      bullRef.current.position.z = BULLSEYE_Z * telescope;
      /*
        The 3D mark is the bullseye for the whole tunnel, then hands over
        to the vector mark in components/Mark.tsx for the final lockup.
        Trying to position 3D geometry and DOM type against each other
        means reconciling a perspective projection with a CSS box on every
        viewport — the cross-fade is exact at every size instead.
      */
      matBull.opacity = 1 - state.logoMorph;
      bullRef.current.visible = matBull.opacity > 0.01;
    }
    bullGlow.current +=
      ((active === "bull" ? 3.4 : 0.18) - bullGlow.current) * k;

    // The spider only makes sense on a flat board; it fades as we telescope.
    if (spokeRef.current) {
      matWire.opacity = Math.max(0, 1 - telescope * 1.6);
      spokeRef.current.visible = matWire.opacity > 0.01;
    }

    // Ring 2 opens as an exploded stack of four slabs.
    const spread = ringThickness(RING_RADIUS[1]) * 1.7;
    layerRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const stagger = Math.min(1, Math.max(0, clip * 2.2 - i * 0.3));
      const e = stagger * stagger * (3 - 2 * stagger);
      mesh.position.z = (i - 1.5) * spread * e;
      mesh.scale.setScalar(1 - (3 - i) * 0.012 * e);
    });

    // Ring 3 segments light in sequence; DTR (index 4) lands last.
    // Lit in sequence during the fit beat, then released. Left on, ring 3
    // keeps burning a cyan arc into every later frame.
    segHold.current += ((active === 2 ? 1 : 0) - segHold.current) * k;
    matSegments.forEach((mat, i) => {
      const t = Math.min(1, Math.max(0, segments * FIT_SEGMENTS - i));
      mat.emissiveIntensity = t * 1.05 * segHold.current;
    });

    // Ring 4: bars grow, trend line draws on. Visible only in its beat.
    const bars = barsRef.current;
    const fade = active === 3 ? 1 : 0;
    matPoints.opacity += (fade - matPoints.opacity) * k;
    matTrend.opacity = matPoints.opacity;
    matAxis.opacity = matPoints.opacity * 0.8;
    const chart = chartRef.current;
    if (chart) {
      chart.visible = matPoints.opacity > 0.02;
      chart.position.z = RING_Z[3] * telescope;
    }
    if (bars && chart?.visible) {
      const { count, x, height, barWidth } = analytics;
      for (let i = 0; i < count; i++) {
        // Bars rise left to right, so the chart reads as being drawn.
        const t = Math.min(1, Math.max(0, resolve * 1.9 - (i / count) * 0.9));
        const e = t * t * (3 - 2 * t);
        dummy.position.set(x[i], -RING_RADIUS[3] * 0.34, 0);
        dummy.scale.set(barWidth, Math.max(0.0001, height[i] * e), barWidth * 0.6);
        dummy.updateMatrix();
        bars.setMatrixAt(i, dummy.matrix);
      }
      bars.instanceMatrix.needsUpdate = true;
    }
    if (trendRef.current) {
      const drawn = Math.min(1, Math.max(0, resolve * 1.4 - 0.25));
      const total = trendGeo.index ? trendGeo.index.count : 0;
      trendGeo.setDrawRange(0, Math.floor(total * drawn));
      trendRef.current.visible = drawn > 0.01;
    }

    // Ring 5 does not shatter — an aperture closes behind the camera.
    if (apertureRef.current) {
      apertureRef.current.scale.setScalar(1 + aperture * 0.9);
    }

    // Bullseye white-out, which also masks the ring-6 crossing. Added to
    // the eased base rather than onto last frame's value, which would
    // accumulate and oscillate.
    matBull.emissiveIntensity = bullGlow.current + flash * 14;
  });

  return (
    <group>
      {RING_RADIUS.map((radius, i) => {
        if (i === 1) {
          // Ring 2 IS the four slabs — no solid shell, so it can open.
          return (
            <group key={i} ref={(el) => void (ringRefs.current[i] = el)}>
              {layered.map((geo, li) => (
                <mesh
                  key={li}
                  ref={(el) => void (layerRefs.current[li] = el)}
                  geometry={geo}
                  material={matLayers[li]}
                />
              ))}
            </group>
          );
        }

        if (i === 2) {
          return (
            <group key={i} ref={(el) => void (ringRefs.current[i] = el)}>
              {fitSegments.map((geo, si) => (
                <mesh
                  key={si}
                  geometry={geo}
                  material={matSegments[si]}
                  position={[0, 0, ringThickness(radius) / 2 + 0.12]}
                />
              ))}
              <mesh geometry={rings[i]} material={matRings[i]} />
            </group>
          );
        }

        if (i === 4) {
          return (
            <group key={i} ref={(el) => void (ringRefs.current[i] = el)}>
              <group ref={apertureRef}>
                <mesh geometry={rings[i]} material={matRings[i]} />
              </group>
            </group>
          );
        }

        return (
          <group key={i} ref={(el) => void (ringRefs.current[i] = el)}>
            <mesh geometry={rings[i]} material={matRings[i]} />
          </group>
        );
      })}

      {/* Ring 4's analytics: bars, axis, trend line. */}
      <group ref={chartRef} visible={false}>
        <instancedMesh
          ref={barsRef}
          args={[barGeo, matPoints, analytics.count]}
          frustumCulled={false}
          raycast={() => null}
        />
        <mesh geometry={axisGeo} material={matAxis} />
        <mesh ref={trendRef} geometry={trendGeo} material={matTrend} />
      </group>

      <mesh
        ref={spokeRef}
        geometry={spokes}
        material={matWire}
        position={[0, 0, MAX_RING_THICKNESS / 2 + 0.2]}
      />

      <mesh ref={bullRef} geometry={bullGeo} material={matBull} />
    </group>
  );
}

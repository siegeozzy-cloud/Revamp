"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { BULLSEYE_RADIUS, RING_RADIUS, dartLaunch, dartPath } from "@/storyboard/world";
import { Dart } from "./Dart";
import type { StageState } from "./state";

const _pos = new THREE.Vector3();
const _ahead = new THREE.Vector3();
const _behind = new THREE.Vector3();
const _look = new THREE.Vector3();

/**
 * The dart, on its launch arc and then on the spiral.
 *
 * Before `launch` reaches 1 the dart is in hand and travelling toward ring
 * 1's strike point; after that it is on the spiral. The two agree exactly
 * at the handover (verified: gap 0.0000), so there is no seam.
 */
export function DartRig({ state }: { state: StageState }) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);

  /** World position at a given moment of the flight. */
  const place = (launch: number, t: number, telescope: number) => {
    const [x, y, z] = launch < 1 ? dartLaunch(launch) : dartPath(t);
    // Only the spiral lives in telescoped space; the launch arc is in front
    // of the board either way.
    return _pos.set(x, y, launch < 1 ? z : z * telescope);
  };

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const { launch, dartT, telescope } = state;

    g.position.copy(place(launch, dartT, telescope));

    // Tangent by finite difference, in whichever space we are in.
    const step = launch < 1 ? 0.03 : 0.015;
    if (launch < 1) {
      _ahead.copy(place(Math.min(launch + step, 1), dartT, telescope));
      _behind.copy(place(Math.max(launch - step, 0), dartT, telescope));
    } else {
      _ahead.copy(place(1, Math.min(dartT + step, 1), telescope));
      _behind.copy(place(1, Math.max(dartT - step, 0), telescope));
    }

    // The tip runs along -Z, so aim +Z back down the path.
    _look.copy(_behind).sub(_ahead);
    if (_look.lengthSq() > 1e-6) g.lookAt(_look.add(g.position));

    // Shrink into the narrowing tunnel. Nothing in frame reveals the cheat.
    // Interpolated between rings rather than stepped, and carried all the
    // way down to the bullseye — at ring 6's size the dart is bigger than
    // the mark it is supposed to be landing in.
    const scaled = Math.min(Math.max(dartT, 0), 1) * 6;
    const i0 = Math.min(Math.floor(scaled), 5);
    const f = scaled - i0;
    const r0 = RING_RADIUS[i0];
    const r1 = i0 < 5 ? RING_RADIUS[i0 + 1] : BULLSEYE_RADIUS;
    const r = r0 + (r1 - r0) * f;
    const base = Math.min(1, Math.max(0.14, (r / RING_RADIUS[0]) * 0.92 + 0.1));
    // Retire into the flash on the final impact rather than staying stuck
    // through the mark.
    const target = base * (1 - state.dartFade);
    g.scale.setScalar(g.scale.x + (target - g.scale.x) * Math.min(1, dt * 6));
    g.visible = g.scale.x > 0.015;

    if (spin.current) spin.current.rotation.z += dt * 2.2;
  });

  return (
    <group ref={group}>
      <group ref={spin}>
        <Dart quality={state.quality} />
      </group>
    </group>
  );
}

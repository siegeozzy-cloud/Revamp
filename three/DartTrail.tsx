"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { dartLaunch, dartPath } from "@/storyboard/world";
import { QUALITY } from "@/storyboard/timeline";
import { PALETTE } from "./materials";
import type { StageState } from "./state";

/**
 * The spiral, drawn.
 *
 * Until now the dart's path existed only as the dart's position — you saw
 * where it was, never where it had been, so the spiral that makes the
 * whole flight legible was invisible. This trails a run of glowing beads
 * behind the tip, sampled along the real path functions rather than from
 * recorded positions, so it is exact at any scroll speed and correct when
 * the reader scrubs backwards.
 */
/** How far behind the tip the trail reaches, in flight-progress units. */
const TAIL = 0.17;

export function DartTrail({ state }: { state: StageState }) {
  const beads = QUALITY[state.quality].trailBeads;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const geo = useMemo(() => new THREE.SphereGeometry(0.5, 6, 5), []);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [geo, mat]);

  /*
    Bead colours, written ONCE.

    They were being recomputed and re-uploaded on every frame, but every
    term in them — `fade`, and so the lerp and the multiplier — depends
    only on `i / (beads - 1)`. They are constants. So each frame paid a
    full instanceColor buffer upload to the GPU plus `beads` Color
    allocations-worth of maths to arrive at exactly the values already
    sitting there.
  */
  useEffect(() => {
    const inst = mesh.current;
    if (!inst) return;
    const colour = new THREE.Color();
    const live = new THREE.Color(PALETTE.aimLive);
    const dim = new THREE.Color(PALETTE.aim);
    for (let i = 0; i < beads; i++) {
      const fade = (1 - i / (beads - 1)) ** 1.6;
      colour.copy(dim).lerp(live, fade).multiplyScalar(0.45 + fade * 1.5);
      inst.setColorAt(i, colour);
    }
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  }, [beads, geo, mat]);

  useFrame(() => {
    const inst = mesh.current;
    if (!inst) return;
    const { launch, dartT, telescope } = state;

    // Nothing to trail before the throw is released, and nothing after the
    // dart has retired into the bullseye.
    inst.visible = launch > 0.02 && state.dartFade < 0.98;
    if (!inst.visible) return;
    mat.opacity = 0.9 * (1 - state.dartFade);

    for (let i = 0; i < beads; i++) {
      // 0 at the tip, 1 at the far end of the tail.
      const back = i / (beads - 1);
      let x: number, y: number, z: number;

      if (launch < 1) {
        const u = Math.max(0, launch - back * TAIL * 3);
        [x, y, z] = dartLaunch(u);
      } else {
        const t = dartT - back * TAIL;
        if (t >= 0) {
          [x, y, z] = dartPath(t);
          z *= telescope;
        } else {
          // Reach back onto the launch arc so the trail does not stop dead
          // at ring 1.
          [x, y, z] = dartLaunch(1 + t / TAIL);
        }
      }

      dummy.position.set(x, y, z);
      // Taper along the tail. Constant per bead, like the colour, but it
      // rides the matrix that the position has to rewrite anyway.
      dummy.scale.setScalar(0.4 + (1 - back) ** 1.6 * 3.2);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }

    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[geo, mat, beads]}
      frustumCulled={false}
      raycast={() => null}
    />
  );
}

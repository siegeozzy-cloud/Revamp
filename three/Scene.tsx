"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CAMERA, zOfDepth } from "@/storyboard/world";
import { QUALITY, poseAt } from "@/storyboard/timeline";
import { dprRange } from "./device";
import { Board } from "./Board";
import { DartRig } from "./DartRig";
import { DartTrail } from "./DartTrail";
import { DotField } from "./DotField";
import { Lighting } from "./Lighting";
import type { StageState } from "./state";

/**
 * Reads the scroll position, writes the scene pose, moves the camera.
 * The single place where "where we are on the page" becomes "what the
 * scene looks like" — everything downstream just reads StageState.
 */
function Driver({
  state,
  progress,
}: {
  state: StageState;
  progress: { current: number };
}) {
  const { camera, invalidate } = useThree();
  const settled = useRef(false);

  // frameloop is "demand", so scrolling has to ask for frames.
  useEffect(() => {
    const ask = () => {
      settled.current = false;
      invalidate();
    };
    window.addEventListener("scroll", ask, { passive: true });
    window.addEventListener("resize", ask, { passive: true });
    ask();
    return () => {
      window.removeEventListener("scroll", ask);
      window.removeEventListener("resize", ask);
    };
  }, [invalidate]);

  useFrame((_, dt) => {
    const pose = poseAt(progress.current);
    Object.assign(state, pose);

    const targetZ = zOfDepth(pose.depth);
    const before = camera.position.z;
    const ease = Math.min(1, dt * 11);
    camera.position.z += (targetZ - camera.position.z) * ease;
    camera.position.x += (pose.drift[0] - camera.position.x) * ease;
    camera.position.y += (pose.drift[1] - camera.position.y) * ease;
    // Always look down the tunnel, not at the drift target — that is what
    // turns the offset into parallax instead of a pan.
    camera.lookAt(0, 0, camera.position.z - 100);

    // Keep requesting frames until the easing has caught up, otherwise a
    // "demand" loop freezes mid-transition the moment scrolling stops.
    const moving =
      Math.abs(targetZ - camera.position.z) > 0.02 ||
      Math.abs(camera.position.z - before) > 0.02;
    if (moving || pose.flash > 0.001) {
      settled.current = false;
      invalidate();
    } else if (!settled.current) {
      settled.current = true;
      invalidate();
    }
  });

  return null;
}

export function Scene({
  state,
  progress,
}: {
  state: StageState;
  progress: { current: number };
}) {
  const q = QUALITY[state.quality];

  return (
    <Canvas
      frameloop="demand"
      // No object in this scene is clickable; skip hit-testing entirely.
      events={undefined}
      style={{ pointerEvents: "none" }}
      /*
        Capped per tier, and never above the screen's real ratio.
        [1, 2] for everyone meant a phone reporting devicePixelRatio 3
        rendered 1.3M pixels of clearcoated, double-sided, additively
        overdrawn scene — before any shader change, this is the single
        largest lever on a handset, because every other cost on the frame
        is paid per pixel.
      */
      dpr={dprRange(q.dpr)}
      gl={{
        // MSAA is bandwidth, and bandwidth is what a mobile tiler runs out
        // of first. Off at the low tier, where DPR is already doing the
        // edge smoothing that matters.
        antialias: q.antialias,
        alpha: false,
        // Nothing here uses the stencil buffer; allocating one costs
        // bandwidth per tile on mobile for nothing.
        stencil: false,
        powerPreference: "high-performance",
      }}
      camera={{
        fov: CAMERA.fov,
        near: CAMERA.near,
        far: CAMERA.far,
        position: [0, 0, 300],
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Lighting tier={state.quality} />
      <DotField tier={state.quality} />
      <Board state={state} />
      <DartRig state={state} />
      <DartTrail state={state} />
      <Driver state={state} progress={progress} />
    </Canvas>
  );
}

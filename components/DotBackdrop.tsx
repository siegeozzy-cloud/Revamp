"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { CAMERA } from "@/storyboard/world";
import { DotField } from "@/three/DotField";

/**
 * The pointer-reactive dot field on its own, as a page backdrop.
 *
 * Same shader as the scroll story uses — one definition of the effect,
 * so tuning it in one place changes it everywhere. Here it gets a plain
 * fixed canvas with a static camera instead of the tunnel rig.
 *
 * Gated the same way the story stage is: no WebGL, reduced motion, or a
 * low-core device means no canvas at all. A decorative backdrop is never
 * worth a stuttering page.
 */
export function DotBackdrop({ intensity = 1 }: { intensity?: number }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ok = false;
    try {
      const c = document.createElement("canvas");
      ok = !!(c.getContext("webgl2") ?? c.getContext("webgl"));
    } catch {
      ok = false;
    }
    if (!ok) return;
    if ((navigator.hardwareConcurrency ?? 8) < 4) return;

    setOn(true);
  }, []);

  if (!on) return null;

  return (
    /*
      `intensity` dials the whole layer back for pages that are read
      rather than watched. At full strength the dots sit on top of body
      copy and fight it; the story page can afford that because its copy
      rides over a scrim.
    */
    <div
      aria-hidden
      style={{ opacity: intensity }}
      className="pointer-events-none fixed inset-0 z-0"
    >
      <Canvas
        frameloop="demand"
        dpr={[1, 2]}
        // Transparent, so the page's own background shows through.
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        camera={{ fov: CAMERA.fov, near: 0.1, far: 2000, position: [0, 0, 0] }}
        // Nothing here is interactive; skip hit-testing entirely.
        events={undefined}
        style={{ pointerEvents: "none" }}
      >
        <DotField />
      </Canvas>
    </div>
  );
}

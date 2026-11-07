"use client";

import dynamic from "next/dynamic";

/**
 * Dev-only inspection route for the Phase 4a scene.
 * WebGL has no server render, so the canvas is loaded client-side only.
 */
const Sandbox = dynamic(() => import("@/three/Sandbox").then((m) => m.Sandbox), {
  ssr: false,
  loading: () => (
    <div className="flex h-[100svh] items-center justify-center text-sm text-faint">
      Building geometry…
    </div>
  ),
});

export default function SandboxPage() {
  return <Sandbox />;
}

"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { PALETTE } from "./materials";

/**
 * Baked-feel lighting with no network request.
 *
 * drei's `preset` environments fetch an HDR from a CDN — a hard dependency
 * and a load-time cost on a page whose whole pitch is that it ships no
 * assets. Instead the environment is rendered once from Lightformers into
 * a 256px cube, which is plenty for brushed metal and costs one frame.
 *
 * No realtime shadows anywhere. A contact-shadow plane does the job the
 * eye actually checks for, at a fraction of the frame budget.
 */
export function Lighting() {
  return (
    <>
      <color attach="background" args={[PALETTE.void]} />
      {/*
        Fog starts past the hero camera's distance to the board (469 units),
        so the opening shot is clean and only the far end of the tunnel
        fades. Pulling it closer swallows the board at the one moment it
        has to be recognisable as a dartboard.
      */}
      <fog attach="fog" args={[PALETTE.void, 430, 1150]} />

      <ambientLight intensity={0.45} />

      {/* Key: rakes across the ring bevels from upper left. */}
      <directionalLight position={[-60, 70, 90]} intensity={2.6} color="#dbe7ec" />
      {/* Fill: keeps gunmetal from going black in the tunnel. */}
      <directionalLight position={[40, -30, -40]} intensity={0.7} color="#4d6672" />
      {/* Axial light travelling with the camera, so ring faces stay readable
          as we fly past them. Phase 4b parents this to the camera. */}
      <pointLight position={[0, 0, 40]} intensity={900} decay={2} color="#9fc3d2" />

      <Environment resolution={256} frames={1}>
        {/* Broad soft source — gives the metal its gradient. */}
        <Lightformer
          form="rect"
          intensity={1.6}
          position={[-10, 12, 10]}
          scale={[20, 14, 1]}
          color="#ffffff"
        />
        {/* Cool rim from behind, so ring silhouettes separate from the void. */}
        <Lightformer
          form="rect"
          intensity={1.1}
          position={[12, -6, -14]}
          scale={[16, 10, 1]}
          color="#6f9fb2"
        />
        {/* Brand kiss. Subtle — it tints the metal, it does not colour it. */}
        <Lightformer
          form="circle"
          intensity={0.9}
          position={[6, 8, -10]}
          scale={6}
          color={PALETTE.aim}
        />
        {/* Ring light around the axis, so the tunnel reads as cylindrical. */}
        <Lightformer
          form="ring"
          intensity={0.6}
          position={[0, 0, 24]}
          scale={14}
          color="#9fb8c4"
        />
      </Environment>
    </>
  );
}

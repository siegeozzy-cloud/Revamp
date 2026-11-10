"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { buildDartBody, buildDartFlights, DART } from "./geometry";
import {
  dartBodyMaterial,
  dartFlightMaterial,
  dartTipMaterial,
} from "./materials";
import { QUALITY } from "@/storyboard/timeline";
import type { QualityTier } from "./state";

/**
 * The dart. Built pointing along -Z with its tip at the group origin,
 * so positioning the group positions the TIP — which is what every
 * impact calculation in storyboard/timeline.ts actually refers to.
 */
export function Dart({
  position = [0, 0, 0],
  quality = "high",
  spin = 0,
}: {
  position?: [number, number, number];
  quality?: QualityTier;
  /** Barrel roll in radians. Sells travel without moving the tip. */
  spin?: number;
}) {
  const q = QUALITY[quality];

  const bodyGeo = useMemo(
    () => buildDartBody(Math.max(16, Math.round(q.tubeSegments / 2))),
    [q.tubeSegments],
  );
  const flightGeo = useMemo(() => buildDartFlights(), []);
  const tipGeo = useMemo(() => new THREE.SphereGeometry(0.22, 10, 8), []);

  const matBody = useMemo(() => dartBodyMaterial(), []);
  const matFlight = useMemo(() => dartFlightMaterial(), []);
  const matTip = useMemo(() => dartTipMaterial(), []);

  useEffect(() => {
    return () => {
      [bodyGeo, flightGeo, tipGeo].forEach((g) => g.dispose());
      [matBody, matFlight, matTip].forEach((m) => m.dispose());
    };
  }, [bodyGeo, flightGeo, tipGeo, matBody, matFlight, matTip]);

  return (
    <group position={position} rotation={[0, 0, spin]}>
      <mesh geometry={bodyGeo} material={matBody} />
      <mesh geometry={flightGeo} material={matFlight} />
      {/* Tip light — the only cyan on screen before the first impact. */}
      <mesh geometry={tipGeo} material={matTip} />
      {/*
        A travelling light costs a per-fragment evaluation on every lit
        material in the scene — including the rings that fill the frame —
        to light a 17-unit dart against a black void. Dropped at the low
        tier; the tip is emissive and unlit anyway, so the dart still
        reads, it just stops casting onto the board it is flying at.
      */}
      {q.dartLight && (
        <pointLight
          color="#3fd9f0"
          intensity={18}
          distance={DART.length * 2.5}
          decay={2}
          position={[0, 0, -0.4]}
        />
      )}
    </group>
  );
}

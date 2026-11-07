/**
 * CENTAIM — Phase 4a · Materials
 *
 * Mirrors the CSS tokens in app/globals.css. Gunmetal carries every
 * structural surface; cyan is emissive and appears on exactly one thing
 * at a time, which is what makes it read as "live" rather than as paint.
 */

import * as THREE from "three";

export const PALETTE = {
  void: "#000000",
  gunmetal: "#353e43",
  gunmetalRim: "#46525a",
  gunmetalDeep: "#232b2f",
  aim: "#0e8fa6",
  aimMid: "#17b4cf",
  aimLive: "#3fd9f0",
  steel: "#c3ced4",
  paper: "#ffffff",
} as const;

/** Board body. Brushed metal, not chrome — chrome reads as cheap here. */
export function gunmetalMaterial(clippingPlanes: THREE.Plane[] = []) {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(PALETTE.gunmetal),
    metalness: 0.84,
    roughness: 0.36,
    clearcoat: 0.25,
    clearcoatRoughness: 0.5,
    envMapIntensity: 1.1,
    clippingPlanes,
    clipShadows: true,
    side: THREE.DoubleSide,
  });
}

/**
 * One instance per ring. Same gunmetal, but with a cyan emissive channel
 * that is driven per ring every frame — a single shared material cannot
 * light one ring without lighting all six.
 */
export function ringMaterial() {
  const m = gunmetalMaterial();
  m.emissive = new THREE.Color(PALETTE.aimLive);
  m.emissiveIntensity = 0;
  // Tone-mapped, unlike the inlays and the bullseye. An untone-mapped
  // emissive across a surface this large stops reading as lit metal and
  // becomes flat cyan plastic filling two thirds of the screen.
  m.toneMapped = true;
  return m;
}

/** The spider. Bright drawn steel, so the wires read against the board. */
export function wireMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#8d9ba3"),
    metalness: 0.95,
    roughness: 0.25,
    envMapIntensity: 1.8,
    transparent: true,
  });
}

/** Recessed surfaces — the inner face of each ring, seen down the tunnel. */
export function gunmetalDeepMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(PALETTE.gunmetalDeep),
    metalness: 0.7,
    roughness: 0.55,
    envMapIntensity: 0.7,
    side: THREE.DoubleSide,
  });
}

/**
 * The live ring. `intensity` is driven per beat — 0 when dormant,
 * up to ~2.4 at the moment of impact. Bloom keys off the threshold
 * in storyboard/timeline.ts, so anything under ~1 will not glow.
 */
export function liveMaterial(intensity = 1) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.gunmetalDeep),
    emissive: new THREE.Color(PALETTE.aimLive),
    emissiveIntensity: intensity,
    metalness: 0.5,
    roughness: 0.3,
    toneMapped: false,
  });
}

/** Four architecture layers, base to top: data, api, logic, interface. */
export function layerMaterials() {
  const stops = [
    PALETTE.gunmetalDeep,
    "#2c3940",
    "#3a4a52",
    PALETTE.gunmetalRim,
  ];
  return stops.map(
    (hex, i) =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(hex),
        metalness: 0.6 + i * 0.07,
        roughness: 0.52 - i * 0.06,
        envMapIntensity: 0.9,
        side: THREE.DoubleSide,
      }),
  );
}

/** Turned steel barrel. */
export function dartBodyMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(PALETTE.steel),
    metalness: 0.95,
    roughness: 0.22,
    envMapIntensity: 1.5,
  });
}

/** Dart tip — the only cyan on screen before the first impact. */
export function dartTipMaterial() {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.aim),
    emissive: new THREE.Color(PALETTE.aimLive),
    emissiveIntensity: 1.8,
    toneMapped: false,
  });
}

export function dartFlightMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(PALETTE.paper),
    metalness: 0.1,
    roughness: 0.45,
    transmission: 0.25,
    thickness: 0.4,
    side: THREE.DoubleSide,
  });
}

export function signalPointMaterial() {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(PALETTE.aimLive),
    toneMapped: false,
  });
}

/** Dispose a material or list of them. Sandbox hot-reload leaks without this. */
export function disposeAll(...items: (THREE.Material | THREE.BufferGeometry | undefined)[]) {
  for (const item of items) item?.dispose();
}

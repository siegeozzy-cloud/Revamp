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

/**
 * Board body. Brushed metal, not chrome — chrome reads as cheap here.
 *
 * `side` is FrontSide, not DoubleSide. Every ring comes out of a closed
 * lathe profile, so it is a watertight solid whose normals already face
 * outward (verified by raycasting a FrontSide mesh head-on: it hits the
 * front face at +thickness/2). DoubleSide was therefore shading the far
 * wall of every annulus for nothing — and because the rings fill the
 * viewport, "for nothing" meant a second full-screen pass of the most
 * expensive shader in the scene, on every frame.
 *
 * `cheap` drops MeshPhysicalMaterial for MeshStandardMaterial. Clearcoat
 * is the single costliest feature flag in use here: it adds a second GGX
 * specular lobe and a second environment-map sample per fragment, on
 * surfaces that cover the whole screen. At 0.25 on brushed metal under a
 * baked environment it is close to invisible; on a phone it is the
 * difference between shading the frame once and shading it twice.
 */
export function gunmetalMaterial(cheap = false) {
  const base = {
    color: new THREE.Color(PALETTE.gunmetal),
    metalness: 0.84,
    roughness: 0.36,
    envMapIntensity: 1.1,
    side: THREE.FrontSide,
  };
  return cheap
    ? new THREE.MeshStandardMaterial(base)
    : new THREE.MeshPhysicalMaterial({
        ...base,
        clearcoat: 0.25,
        clearcoatRoughness: 0.5,
      });
}

/**
 * One instance per ring. Same gunmetal, but with a cyan emissive channel
 * that is driven per ring every frame — a single shared material cannot
 * light one ring without lighting all six.
 */
export function ringMaterial(cheap = false) {
  const m = gunmetalMaterial(cheap);
  m.emissive = new THREE.Color(PALETTE.aimLive);
  m.emissiveIntensity = 0;
  // Tone-mapped, unlike the inlays and the bullseye. An untone-mapped
  // emissive across a surface this large stops reading as lit metal and
  // becomes flat cyan plastic filling two thirds of the screen.
  m.toneMapped = true;
  return m;
}

/**
 * The spider. Bright drawn steel, so the wires read against the board.
 *
 * MeshStandardMaterial, not Physical: it set no physical-only property,
 * so the physical shader was identical output for a heavier program and
 * one more shader compile during the first-frame stall.
 */
export function wireMaterial() {
  return new THREE.MeshStandardMaterial({
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

/**
 * Four architecture layers, base to top: data, api, logic, interface.
 * Colours only — see layerStackMaterial for why they are no longer four
 * separate materials.
 */
export const LAYER_STOPS = [
  PALETTE.gunmetalDeep,
  "#2c3940",
  "#3a4a52",
  PALETTE.gunmetalRim,
] as const;

/**
 * Ring 2's slab stack, as ONE material for an InstancedMesh.
 *
 * It used to be four MeshPhysicalMaterials on four meshes. Ring 2 is the
 * beat the camera holds closest and longest (180vh, the longest in the
 * timeline), at which point each slab covers most of the viewport — so
 * four stacked, double-sided, clearcoated annuli meant roughly eight
 * full-frame passes of the heaviest shader in the scene, per frame, for
 * the entire beat. That is the "laggy on ring 2" report.
 *
 * Now: one geometry, one draw call, four instances, per-instance colour.
 * The per-slab metalness/roughness ramp cannot survive instancing (it is
 * a uniform, not an attribute), so it collapses to the midpoint of the
 * old ramp. The colour ramp is what actually reads as four layers.
 */
export function layerStackMaterial(cheap = false) {
  const base = {
    // White, so instanceColor shows through unmodulated.
    color: new THREE.Color(0xffffff),
    metalness: 0.7,
    roughness: 0.43,
    envMapIntensity: 0.9,
    side: THREE.FrontSide,
    /*
      Ring 2 is the one ring that never had a glow: it has no solid shell,
      so matRings[1] was driven every frame by the useFrame loop and then
      attached to no mesh. The stack carries the emissive now, so ring 2
      lights on impact like the other five.
    */
    emissive: new THREE.Color(PALETTE.aimLive),
    emissiveIntensity: 0,
  };
  return cheap
    ? new THREE.MeshStandardMaterial(base)
    : new THREE.MeshPhysicalMaterial({
        ...base,
        clearcoat: 0.2,
        clearcoatRoughness: 0.5,
      });
}

/** Turned steel barrel. Standard, not Physical — see wireMaterial. */
export function dartBodyMaterial() {
  return new THREE.MeshStandardMaterial({
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

/**
 * Dart flights.
 *
 * NO `transmission`. This was the most expensive line in the project.
 *
 * As soon as any material in the scene has transmission > 0, three.js
 * runs renderTransmissionPass() on every frame: it renders the entire
 * opaque scene into a separate framebuffer and generates its mip chain,
 * so that the transmissive surface has something to refract. The whole
 * scene was being drawn twice per frame — doubling every other cost on
 * this list — to put 0.25 of translucency on four 4-unit blades that are
 * a handful of pixels wide for most of the flight and off-screen for the
 * rest of it.
 *
 * The flights stay DoubleSide: they are extruded blades 0.05 deep, not
 * closed solids, so the back face is genuinely visible. Four tiny meshes
 * is a price worth paying; a second scene render is not.
 */
export function dartFlightMaterial() {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.paper),
    metalness: 0.1,
    roughness: 0.45,
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

/**
 * CENTAIM — Phase 4a · Procedural geometry
 *
 * Nothing here is loaded from a file. Every shape is revolved or extruded
 * at runtime from the constants in storyboard/world.ts, which is why the
 * asset payload is zero and the detail level is a parameter rather than
 * a property of a mesh someone exported.
 *
 * Convention: lathes revolve around +Y, then the geometry is rotated so
 * the ring faces +Z (toward the camera) and its axis runs along Z.
 */

import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RING_RATIO } from "@/storyboard/world";

/**
 * Axial thickness of a ring. Capped in absolute units rather than scaled
 * with radius: a proportional thickness makes the outer ring read as a
 * car tyre instead of a board, and that silhouette is the first thing the
 * hero shot has to get right.
 */
export const MAX_RING_THICKNESS = 4;
export function ringThickness(radius: number) {
  // Never deeper than it is wide — the inner rings are narrow bands.
  return Math.min(MAX_RING_THICKNESS, radius * (1 - RING_RATIO) * 0.85);
}
/** Bevel size, as a fraction of radius. Reads as a machined edge. */
export const RING_BEVEL = 0.05;

/**
 * Profile of one beveled annulus, in (radius, axial) space.
 * Closed loop, so the lathe caps itself.
 */
export function ringProfile(
  innerR: number,
  outerR: number,
  thickness: number,
  bevel: number,
): THREE.Vector2[] {
  const h = thickness / 2;
  const b = Math.min(bevel, thickness * 0.4, (outerR - innerR) * 0.4);
  return [
    new THREE.Vector2(innerR, -h + b),
    new THREE.Vector2(innerR + b, -h),
    new THREE.Vector2(outerR - b, -h),
    new THREE.Vector2(outerR, -h + b),
    new THREE.Vector2(outerR, h - b),
    new THREE.Vector2(outerR - b, h),
    new THREE.Vector2(innerR + b, h),
    new THREE.Vector2(innerR, h - b),
    new THREE.Vector2(innerR, -h + b),
  ];
}

/**
 * One ring band. `radius` is its OUTER edge; the inner edge is the outer
 * edge of the next ring inward, so the flat board has no gaps.
 */
export function buildRing(radius: number, segments: number): THREE.BufferGeometry {
  const innerR = radius * RING_RATIO;
  const thickness = ringThickness(radius);
  const geo = new THREE.LatheGeometry(
    ringProfile(innerR, radius, thickness, radius * RING_BEVEL),
    segments,
  );
  geo.rotateX(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

export const LAYER_COUNT = 4;

/**
 * ONE slab of ring 2's stack — data / api / logic / interface are the same
 * shape, so this is built once and drawn four times as an InstancedMesh.
 *
 * Note what is NOT here: the axial offset. buildLayeredRing used to bake
 * `-total/2 + slab*(i+0.5)` into each geometry with .translate(), which
 * forced four distinct buffers (4x the vertex memory) and four draw calls
 * for four identical shapes. The offset is per-instance data, so it now
 * lives in the instance matrix alongside the fan-out animation that was
 * already being written there. See layerOffset below.
 */
export function buildSlab(radius: number, segments: number): THREE.BufferGeometry {
  const innerR = radius * RING_RATIO;
  const slab = ringThickness(radius) / LAYER_COUNT;
  const geo = new THREE.LatheGeometry(
    ringProfile(innerR, radius, slab * 0.92, radius * RING_BEVEL * 0.5),
    segments,
  );
  geo.rotateX(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

/** Resting Z of slab `i`, stacked along the axis and centred on the plane. */
export function layerOffset(radius: number, i: number): number {
  const total = ringThickness(radius);
  const slab = total / LAYER_COUNT;
  return -total / 2 + slab * (i + 0.5);
}

/**
 * The wire spider: radial spokes from the bullseye to the outer edge.
 * Real tubes, not lines, so they catch the rim light.
 */
export function buildSpokes(
  innerR: number,
  outerR: number,
  count: number,
  tubeRadius: number,
  radialSegments: number,
): THREE.BufferGeometry {
  const length = outerR - innerR;
  const parts: THREE.BufferGeometry[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const g = new THREE.CylinderGeometry(
      tubeRadius,
      tubeRadius,
      length,
      Math.max(4, Math.round(radialSegments / 12)),
      1,
      true,
    );
    // Cylinder runs along Y; lay it flat and point it outward.
    g.rotateZ(Math.PI / 2);
    g.translate(innerR + length / 2, 0, 0);
    g.rotateZ(angle);
    parts.push(g);
  }

  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  if (!merged) throw new Error("buildSpokes: merge failed");
  merged.computeVertexNormals();
  return merged;
}

/** Dart proportions, in world units. The board's outer radius is 50. */
export const DART = {
  length: 17,
  tipRadius: 0.06,
  barrelRadius: 0.78,
  shaftRadius: 0.3,
  flightCount: 4,
  flightLength: 4.2,
  flightWidth: 2.3,
} as const;

/**
 * Turned dart body: tip, barrel, shaft. Lathe-revolved, so the silhouette
 * has real curvature instead of a cone glued to a cylinder.
 * Returned pointing along -Z (flight direction), tip at the origin.
 */
export function buildDartBody(segments: number): THREE.BufferGeometry {
  const { tipRadius, barrelRadius, shaftRadius, length } = DART;

  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(tipRadius, length * 0.02),
    new THREE.Vector2(barrelRadius * 0.55, length * 0.17),
    new THREE.Vector2(barrelRadius, length * 0.3),
    new THREE.Vector2(barrelRadius, length * 0.52),
    new THREE.Vector2(barrelRadius * 0.82, length * 0.6),
    new THREE.Vector2(shaftRadius, length * 0.66),
    new THREE.Vector2(shaftRadius, length * 0.9),
    new THREE.Vector2(shaftRadius * 1.5, length * 0.93),
    new THREE.Vector2(0, length),
  ];

  const geo = new THREE.LatheGeometry(profile, segments);
  // Lathe grows along +Y from the tip. The dart FLIES toward -Z, so its
  // body must trail along +Z behind the tip at the origin.
  geo.rotateX(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

/** Flights, as thin extruded blades around the tail. */
export function buildDartFlights(): THREE.BufferGeometry {
  const { flightCount, flightLength, flightWidth, length } = DART;
  const parts: THREE.BufferGeometry[] = [];

  // Drawn in XY: x = radial width from the shaft, y = length along the dart.
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(flightWidth * 0.18, flightLength * 0.32);
  shape.lineTo(flightWidth, flightLength * 0.72);
  shape.lineTo(flightWidth * 0.92, flightLength);
  shape.lineTo(0, flightLength);
  shape.closePath();

  for (let i = 0; i < flightCount; i++) {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.05,
      bevelEnabled: false,
    });
    // Lay the blade into the XZ plane: width stays radial on X, length runs
    // along +Z (toward the tail), thickness on Y.
    g.rotateX(Math.PI / 2);
    g.rotateZ((i / flightCount) * Math.PI * 2);
    // Seat it at the tail, which is +length from the tip.
    g.translate(0, 0, length - flightLength);
    parts.push(g);
  }

  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  if (!merged) throw new Error("buildDartFlights: merge failed");
  merged.computeVertexNormals();
  return merged;
}

/* -----------------------------------------------------------------------
   THE MARK
   Rebuilt from the logo image rather than imported: no .svg was supplied,
   only a raster. The proportions below are measured off that image — an
   open C, a centre node, an outer node in the gap, and the neck joining
   them. Swap in the real path if the vector file turns up; everything
   else keys off `radius`.
   ----------------------------------------------------------------------- */
export const MARK = {
  /**
   * Where the C opens, in degrees. The arc runs the long way between.
   * The gap has to be wide enough to CONTAIN the outer node — at 28deg
   * the node sat on top of the arc and the two merged into one blob,
   * which is what went wrong the first time.
   */
  gapStart: 76,
  gapEnd: 332,
  /** Stroke width of the C, as a fraction of the outer radius. */
  stroke: 0.35,
  centreNode: 0.26,
  outerNode: 0.21,
  outerNodeAngle: 35,
  outerNodeDistance: 0.56,
  neck: 0.16,
  depth: 0.18,
} as const;

/**
 * @param curveSegments Segments per arc/bezier. This is now the real knob
 * (QUALITY.markCurve), not ringSegments halved. The caller used to pass
 * ringSegments, so the old high tier's 256 became 128 segments on each of
 * six ExtrudeGeometries — two arcs, three circles and a bezier neck.
 * Extrusion triangulates on the CPU through earcut, on the main thread, at
 * mount: that was a visible stall before the first frame, spent on a mark
 * that is a few hundred pixels across at its largest. 48 is already past
 * the point where an arc edge is a straight line on screen.
 */
export function buildLogoMark(radius: number, curveSegments = 32): THREE.BufferGeometry {
  const deg = Math.PI / 180;
  const rOuter = radius;
  const rInner = radius * (1 - MARK.stroke);
  const curve = Math.max(8, Math.round(curveSegments));
  const extrude = { depth: radius * MARK.depth, bevelEnabled: false, curveSegments: curve };

  // The C.
  const c = new THREE.Shape();
  c.absarc(0, 0, rOuter, MARK.gapStart * deg, MARK.gapEnd * deg, false);
  c.absarc(0, 0, rInner, MARK.gapEnd * deg, MARK.gapStart * deg, true);
  c.closePath();

  // Centre node.
  const centre = new THREE.Shape();
  centre.absarc(0, 0, radius * MARK.centreNode, 0, Math.PI * 2, false);

  // Node sitting in the gap, upper right.
  const na = MARK.outerNodeAngle * deg;
  const nx = Math.cos(na) * radius * MARK.outerNodeDistance;
  const ny = Math.sin(na) * radius * MARK.outerNodeDistance;
  const node = new THREE.Shape();
  node.absarc(nx, ny, radius * MARK.outerNode, 0, Math.PI * 2, false);

  /*
    The neck. Concave on both edges, so the two nodes read as one body
    pinching in the middle rather than two circles on a stick. Points are
    the same ones components/Mark.tsx uses, normalised against its 100-unit
    viewBox, with Y negated because that file is in SVG (y-down) space.
  */
  const k = radius / 100;
  const pt = (x: number, y: number) => [x * k, -y * k] as const;
  const neck = new THREE.Shape();
  {
    const [sx, sy] = pt(14.91, 21.3);
    const [c1x, c1y] = pt(16.85, -5.22);
    const [c2x, c2y] = pt(34.95, -18.42);
    const [ex, ey] = pt(57.92, -14.92);
    const [lx, ly] = pt(33.82, -49.32);
    const [d1x, d1y] = pt(29.27, -26.53);
    const [d2x, d2y] = pt(10.67, -14.06);
    const [fx, fy] = pt(-14.91, -21.3);
    neck.moveTo(sx, sy);
    neck.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);
    neck.lineTo(lx, ly);
    neck.bezierCurveTo(d1x, d1y, d2x, d2y, fx, fy);
    neck.closePath();
  }

  /** Round caps on both arc ends — the real mark has ball terminals. */
  const capR = (rOuter - rInner) / 2;
  const capAt = (angleDeg: number) => {
    const a = angleDeg * deg;
    const mid = (rOuter + rInner) / 2;
    const shape = new THREE.Shape();
    shape.absarc(Math.cos(a) * mid, Math.sin(a) * mid, capR, 0, Math.PI * 2, false);
    return new THREE.ExtrudeGeometry(shape, extrude);
  };

  const parts = [
    new THREE.ExtrudeGeometry(c, extrude),
    capAt(MARK.gapStart),
    capAt(MARK.gapEnd),
    new THREE.ExtrudeGeometry(centre, extrude),
    new THREE.ExtrudeGeometry(node, extrude),
    // Already in final orientation — the path encodes the angle.
    new THREE.ExtrudeGeometry(neck, extrude),
  ];

  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  if (!merged) throw new Error("buildLogoMark: merge failed");
  // Only the depth is recentred. Centring in X/Y would shift the mark off
  // the C's axis, because the outer node makes the bounding box lopsided.
  merged.translate(0, 0, -(radius * MARK.depth) / 2);
  merged.computeVertexNormals();
  return merged;
}

/* -----------------------------------------------------------------------
   RING 4 — ANALYTICS
   A resolving point cloud read as scattered dust, not as analysis. Bars
   with a trend line over them say "this is what your data said" at a
   glance, which is the whole claim the beat is making.
   ----------------------------------------------------------------------- */
export interface AnalyticsData {
  count: number;
  /** x centre of each bar. */
  x: Float32Array;
  /** full height of each bar at resolve = 1. */
  height: Float32Array;
  barWidth: number;
  /** Curve through the bar tops, for the trend line. */
  trend: THREE.CatmullRomCurve3;
}

export function buildAnalytics(radius: number, count = 18): AnalyticsData {
  // The ring's hole is 2 * RING_RATIO * radius across. Anything wider is
  // hidden behind the band it is supposed to sit inside.
  const span = radius * RING_RATIO * 1.44;
  const barWidth = (span / count) * 0.56;
  const x = new Float32Array(count);
  const height = new Float32Array(count);
  const tops: THREE.Vector3[] = [];

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    // Rising trend with believable noise, not a clean curve.
    const noise = Math.sin(i * 2.3) * 0.055 + Math.sin(i * 7.1) * 0.025;
    const base = 0.18 + t * 0.62;
    const h = Math.max(0.05, (base + noise) * radius * 0.5);
    x[i] = -span / 2 + t * span;
    height[i] = h;
    tops.push(new THREE.Vector3(x[i], h - radius * 0.34, 0));
  }

  return {
    count,
    x,
    height,
    barWidth,
    trend: new THREE.CatmullRomCurve3(tops, false, "catmullrom", 0.3),
  };
}

/**
 * Ring 4's point cloud. Returns per-instance positions in two states —
 * scattered around the ring, and resolved onto a trend line — so the
 * shader/instance update can lerp between them with one uniform.
 */
export function buildSignalPoints(count: number, radius: number) {
  const scattered = new Float32Array(count * 3);
  const resolved = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const angle = t * Math.PI * 2 * 3;
    const jitter = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const j = jitter - Math.floor(jitter);

    // Scattered: a noisy band hugging the ring, not a cloud filling it.
    const sr = radius * (0.88 + j * 0.2);
    scattered[i * 3] = Math.cos(angle) * sr;
    scattered[i * 3 + 1] = Math.sin(angle) * sr;
    scattered[i * 3 + 2] = (j - 0.5) * radius * 0.18;

    // Resolved: a rising trend line across the ring's face.
    const x = (t - 0.5) * radius * 1.9;
    resolved[i * 3] = x;
    resolved[i * 3 + 1] =
      Math.sin(t * Math.PI * 1.2) * radius * 0.42 + (t - 0.5) * radius * 0.5;
    resolved[i * 3 + 2] = 0;

    seeds[i] = j;
  }

  return { scattered, resolved, seeds, count };
}

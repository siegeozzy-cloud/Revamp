/**
 * CENTAIM — "One Throw"
 * Phase 2 · World model
 *
 * The board is not flat for most of the page. At the throw it TELESCOPES:
 * the rings separate along -Z into a tunnel, outer ring nearest the viewer,
 * bullseye deepest. The camera then flies down that tunnel, and the dart
 * flies ahead of it. At the bullseye the tunnel collapses back to a plane
 * and the bullseye resolves into the Centaim mark.
 *
 * Units are arbitrary world units. Only ratios matter.
 */

/** Each ring is RING_RATIO times the radius of the one outside it. */
export const RING_RATIO = 0.72;

/** Outermost ring radius. Everything else derives from this. */
export const R_OUTER = 50;

/** Gap to the next ring inward, as a multiple of the current ring's radius.
 *  Proportional (not constant) spacing is what makes the tunnel self-similar. */
export const GAP_FACTOR = 1.1;

/**
 * Camera resting distance in front of a ring, as a multiple of its radius.
 *
 * Derived, not guessed. At distance d the viewport's half-height is
 * d·tan(fov/2) = 0.384d at fov 42. For ring i to fill the frame we need
 * 0.384·HOLD·R ≈ R, so HOLD ≈ 2.6. At 2.4 the ring sits just proud of the
 * top and bottom edges: immersive, still whole.
 *
 * (Phase 2 shipped this at 1.25 on the reasoning that 1.25 radii was
 * "slightly overflowing". That confused radius with half-height — at 1.25
 * the ring is four times the frame and the beat you are reading about is
 * entirely off-screen. Caught by rendering it.)
 */
export const HOLD_FACTOR = 2.4;

/** How far ahead of the camera the dart flies, as a multiple of the target
 *  ring's radius. Must exceed HOLD_FACTOR so the impact reads before the
 *  camera settles, and must be ≳2.3 for the strike point to be in frame. */
export const LEAD_FACTOR = 3.0;

export const RING_COUNT = 6;

/** Ring radii, outside -> in. R[0] is the outer ring (beat 1). */
export const RING_RADIUS: number[] = Array.from(
  { length: RING_COUNT },
  (_, i) => R_OUTER * RING_RATIO ** i,
);
// [50.00, 36.00, 25.92, 18.66, 13.44, 9.68]

/** Bullseye disc radius — one more step inward. */
export const BULLSEYE_RADIUS = R_OUTER * RING_RATIO ** RING_COUNT; // 6.97

/** Ring Z positions after telescoping. RING_Z[0] = 0, deeper rings negative. */
export const RING_Z: number[] = RING_RADIUS.reduce<number[]>((acc, r, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] - GAP_FACTOR * RING_RADIUS[i - 1]);
  return acc;
}, []);
// [0, -55.0, -94.6, -123.1, -143.6, -158.4]

/** Bullseye plane. The deepest point in the scene. */
export const BULLSEYE_Z =
  RING_Z[RING_COUNT - 1] - GAP_FACTOR * RING_RADIUS[RING_COUNT - 1]; // -169.0

/** Camera resting Z for each beat's hold. */
export const CAM_HOLD_Z: number[] = RING_RADIUS.map(
  (r, i) => RING_Z[i] + HOLD_FACTOR * r,
);
// [62.5, -10.0, -62.2, -99.8, -126.8, -146.3]

/** Camera Z at the bullseye hold, and at the final logo resolve. */
export const CAM_BULLSEYE_Z = BULLSEYE_Z + HOLD_FACTOR * BULLSEYE_RADIUS; // -160.3
/**
 * The final push-in stops here rather than at the bullseye's face. At 2.5
 * units the disc is seven viewport-heights across and the frame is a flat
 * cyan wash with no edge, which reads as a render error rather than an
 * ending. TODO(phase-5): the bullseye should resolve into the Centaim
 * mark here — that morph is specified in MECHANISM.logoMorph and is not
 * yet built, so this is currently just a well-framed disc.
 */
export const CAM_RESOLVE_Z = BULLSEYE_Z + 13;

/** Camera Z before the throw (board reads as a whole disc, face-on). */
export const CAM_HERO_Z = 300;

/**
 * Depth parameter. Distance from the camera to the bullseye plane.
 * ALL camera interpolation happens in log(depth), never in Z directly —
 * the tunnel is geometric, so linear Z reads as accelerating into a wall.
 */
export const depthOf = (z: number) => z - BULLSEYE_Z;
export const zOfDepth = (d: number) => BULLSEYE_Z + d;

/** Constant-perceived-speed interpolation between two camera depths. */
export const lerpDepth = (from: number, to: number, t: number) =>
  Math.exp(Math.log(from) + (Math.log(to) - Math.log(from)) * t);

/** Dart Z for a given camera Z while targeting ring `i`. */
export const dartZFor = (camZ: number, i: number) =>
  camZ - LEAD_FACTOR * RING_RADIUS[i];

/* -----------------------------------------------------------------------
   THE SPIRAL
   A ring is an annulus. A dart travelling straight down the axis passes
   through the hole in the middle of every one of them and never strikes
   anything. So the dart does not fly straight — it SPIRALS inward, meeting
   each ring at that ring's own radius and winding toward the bullseye.
   The camera still flies straight down the axis, which is what makes the
   spiral readable: the dart crosses the frame at every beat.
   ----------------------------------------------------------------------- */

/** Where in a ring's band the dart strikes. 0.5 would be dead centre. */
export const STRIKE_BAND = 0.55;

/** Degrees the strike point advances per ring. Coprime-ish with 360 so no
 *  two consecutive strikes sit on the same side of the frame. */
export const STRIKE_TURN = 137;

/** Radius at which the dart meets ring `i`. */
export const strikeRadius = (i: number) => {
  const outer = RING_RADIUS[i];
  const inner = outer * RING_RATIO;
  return inner + (outer - inner) * STRIKE_BAND;
};

/** Angle, in radians, at which the dart meets ring `i`. */
export const strikeAngle = (i: number) =>
  ((STRIKE_TURN * i - 38) * Math.PI) / 180;

/**
 * Ring thickness at ring `i`. Duplicated from three/geometry so the path
 * maths does not depend on the render layer.
 */
const thicknessOf = (i: number) =>
  Math.min(4, RING_RADIUS[i] * (1 - RING_RATIO) * 0.85);

/**
 * Full strike point for ring `i`, in world space.
 *
 * Sits on the ring's FRONT face rather than its mid-plane. On the
 * mid-plane the tip is buried inside the solid and the barrel reads as
 * clipping through it; on the face it reads as struck.
 */
export const strikePoint = (i: number): [number, number, number] => {
  const r = strikeRadius(i);
  const a = strikeAngle(i);
  return [Math.cos(a) * r, Math.sin(a) * r, RING_Z[i] + thicknessOf(i) / 2];
};

/**
 * Which half of the frame ring `i` is struck in. Copy goes on the other
 * side — the dart and the headline competing for the same corner was the
 * first thing that broke when both were placed by hand.
 */
export const strikeSide = (i: number): "left" | "right" =>
  Math.cos(strikeAngle(i)) > 0 ? "right" : "left";

/** The bullseye strike is dead centre, which is the whole point. */
export const BULLSEYE_POINT: [number, number, number] = [0, 0, BULLSEYE_Z];

/**
 * Where the dart starts: in hand, below and right of the hero camera,
 * close enough to read as held rather than as a distant object.
 */
export const LAUNCH_POINT: [number, number, number] = [26, -17, CAM_HERO_Z - 26];

/** Dart position during the throw, before it reaches ring 1. u in [0,1]. */
export function dartLaunch(u: number): [number, number, number] {
  const to = strikePoint(0);
  // Ease out of the hand fast, then settle onto the spiral.
  const e = 1 - Math.pow(1 - Math.min(Math.max(u, 0), 1), 2.4);
  return [
    LAUNCH_POINT[0] + (to[0] - LAUNCH_POINT[0]) * e,
    LAUNCH_POINT[1] + (to[1] - LAUNCH_POINT[1]) * e,
    LAUNCH_POINT[2] + (to[2] - LAUNCH_POINT[2]) * e,
  ];
}

/**
 * Dart position at global flight progress `t` in [0,1], where t = i/6 lands
 * exactly on ring i's strike point. Catmull-Rom through the strike points
 * so the path curves instead of hinging at each ring.
 */
/**
 * Control points for the spiral. Hoisted to module scope because they are
 * constants: they derive only from RING_RADIUS and the strike constants.
 *
 * Rebuilding them inside dartPath meant seven strikePoint() calls — each a
 * sin and a cos — plus two array allocations on every call, and dartPath
 * is called 160+ times per frame by DartTrail alone, plus three more by
 * DartRig's finite-difference tangent. That was ~1,100 trig calls and
 * ~320 allocations per frame to recompute the same seven points.
 */
const PATH_POINTS: [number, number, number][] = [
  ...RING_RADIUS.map((_, i) => strikePoint(i)),
  BULLSEYE_POINT,
];

export function dartPath(t: number): [number, number, number] {
  const pts = PATH_POINTS;
  const n = pts.length - 1;
  const scaled = Math.min(Math.max(t, 0), 1) * n;
  const i = Math.min(Math.floor(scaled), n - 1);
  const f = scaled - i;

  const p = (k: number) => pts[Math.min(Math.max(k, 0), n)];
  const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];

  const cr = (a: number, b: number, c: number, d: number) => {
    const t2 = f * f;
    const t3 = t2 * f;
    return (
      0.5 *
      (2 * b +
        (-a + c) * f +
        (2 * a - 5 * b + 4 * c - d) * t2 +
        (-a + 3 * b - 3 * c + d) * t3)
    );
  };

  return [
    cr(p0[0], p1[0], p2[0], p3[0]),
    cr(p0[1], p1[1], p2[1], p3[1]),
    cr(p0[2], p1[2], p2[2], p3[2]),
  ];
}

export const CAMERA = {
  fov: 42,
  near: 0.1,
  far: 2000,
  /** Subtle off-axis drift so the tunnel never looks like a screensaver. */
  driftAmplitude: 1.4,
  driftFrequency: 0.35,
} as const;

/**
 * CENTAIM — "One Throw"
 * Phase 2 · Master scroll timeline
 *
 * One global progress value `p` in [0,1] drives the entire page.
 * p = scrollY / (TOTAL_VH * viewportHeight / 100)
 *
 * Nothing in the scene listens to scroll. Everything reads `p`.
 * This file is the single source of truth for pacing; Phase 4 consumes it
 * and must not hardcode a number that lives here.
 */

import {
  BULLSEYE_RADIUS,
  BULLSEYE_Z,
  CAM_BULLSEYE_Z,
  CAM_HERO_Z,
  CAM_HOLD_Z,
  CAM_RESOLVE_Z,
  LEAD_FACTOR,
  RING_RADIUS,
  RING_Z,
  depthOf,
  strikeSide,
} from "./world";

/** Scroll length of each beat, in vh. Derived from Phase 1 word counts. */
export const BEAT_VH = {
  hero: 100,
  throw: 120,
  styles: 100,
  structure: 180,
  fit: 160,
  signal: 80,
  security: 100,
  lasts: 80,
  bullseye: 120,
} as const;

export const TOTAL_VH = Object.values(BEAT_VH).reduce((a, b) => a + b, 0); // 1040

export type BeatId = keyof typeof BEAT_VH;

/** Cumulative p boundary for each beat. */
export const BEAT_RANGE = (() => {
  let acc = 0;
  const out = {} as Record<BeatId, { from: number; to: number }>;
  for (const [id, vh] of Object.entries(BEAT_VH) as [BeatId, number][]) {
    out[id] = { from: acc / TOTAL_VH, to: (acc + vh) / TOTAL_VH };
    acc += vh;
  }
  return out;
})();
// hero      0.000 – 0.096
// throw     0.096 – 0.212
// styles    0.212 – 0.308
// structure 0.308 – 0.481
// fit       0.481 – 0.635
// signal    0.635 – 0.712
// security  0.712 – 0.808
// lasts     0.808 – 0.885
// bullseye  0.885 – 1.000

/** Which ring each beat targets, and when the dart strikes it. */
export const IMPACTS: { beat: BeatId; ring: number; p: number }[] = [
  { beat: "styles", ring: 0, p: 0.250 },
  { beat: "structure", ring: 1, p: 0.360 },
  { beat: "fit", ring: 2, p: 0.505 },
  { beat: "signal", ring: 3, p: 0.660 },
  { beat: "security", ring: 4, p: 0.748 },
  { beat: "lasts", ring: 5, p: 0.845 },
  { beat: "bullseye", ring: -1, p: 0.918 },
];

/** p at which each beat's camera settles on its hold. */
const HOLD_P = [0.300, 0.455, 0.615, 0.712, 0.795, 0.885];

/**
 * CAMERA KEYFRAMES — depth, i.e. distance to the bullseye plane, because
 * that is the value we interpolate logarithmically.
 *
 * Every value is DERIVED from world.ts rather than written down. The first
 * draft hardcoded them, and when HOLD_FACTOR had to change the table and
 * the scene silently disagreed. Deriving removes that whole class of bug.
 */
export const CAMERA_KEYS: { p: number; depth: number; note: string }[] = [
  { p: 0.0, depth: depthOf(CAM_HERO_Z), note: "hero — board whole, face-on" },
  { p: 0.096, depth: depthOf(CAM_HERO_Z) * 0.94, note: "aim overlay snaps on" },
  { p: 0.14, depth: depthOf(CAM_HERO_Z) * 0.92, note: "TELESCOPE begins" },
  { p: 0.175, depth: depthOf(CAM_HERO_Z) * 0.84, note: "telescope settled, dart released" },
  ...IMPACTS.flatMap(({ beat, ring, p }, i) => {
    const r = ring < 0 ? BULLSEYE_RADIUS : RING_RADIUS[ring];
    const z = ring < 0 ? BULLSEYE_Z : RING_Z[ring];
    const impact = { p, depth: depthOf(z + LEAD_FACTOR * r), note: `IMPACT ${beat}` };
    const hold =
      ring < 0
        ? { p: 0.965, depth: depthOf(CAM_BULLSEYE_Z), note: "bullseye hold" }
        : { p: HOLD_P[i], depth: depthOf(CAM_HOLD_Z[ring]), note: `${beat} hold` };
    return [impact, hold];
  }),
  { p: 1.0, depth: depthOf(CAM_RESOLVE_Z), note: "logo resolve" },
];

/**
 * Dart flight progress for a given scroll position. The dart spirals
 * through six strike points, so t = i/6 must coincide exactly with
 * IMPACTS[i].p or the tip misses the ring it is supposed to hit.
 */
export function dartTAt(p: number): number {
  const first = IMPACTS[0].p;
  // Before ring 1 the dart is still on its launch arc, not on the spiral.
  if (p < first) return 0;
  for (let i = 0; i < IMPACTS.length - 1; i++) {
    const a = IMPACTS[i].p;
    const b = IMPACTS[i + 1].p;
    if (p <= b) return (i + (p - a) / (b - a)) / 6;
  }
  return 1;
}

/**
 * Launch progress, 0..1, across the throw. Below 1 the dart is on its
 * launch arc (world.dartLaunch); at 1 it joins the spiral and dartTAt
 * takes over. The handover point is IMPACTS[0].p, where both functions
 * return the same world position — strikePoint(0).
 */
export function dartLaunchAt(p: number): number {
  const release = TELESCOPE.to;
  const first = IMPACTS[0].p;
  if (p <= release) return 0;
  if (p >= first) return 1;
  return (p - release) / (first - release);
}

/** Beats that pin. Beats 4 (signal) and 6 (lasts) deliberately do not. */
export const PINNED: Record<BeatId, boolean> = {
  hero: false,
  throw: true,
  styles: true,
  structure: true,
  fit: true,
  signal: false,
  security: true,
  lasts: false,
  bullseye: true,
};

/**
 * PER-RING MECHANISM
 * Each ring does one thing and one thing only. The value is a local 0->1
 * driven over the given p window; Phase 4 feeds it straight to the material
 * or geometry uniform named here.
 */
export const MECHANISM = {
  /** Ring 1 — surface. Anisotropic sheen sweeps the bevel on impact. */
  styles: { uniform: "uSheen", from: 0.250, to: 0.300 },

  /** Ring 2 — the cut. A clipping plane sweeps the dart's hole open,
   *  exposing 4 stacked layers (data / api / logic / interface) at the cap. */
  structureClip: { uniform: "uClip", from: 0.370, to: 0.420 },
  structureLayers: { uniform: "uLayerReveal", from: 0.378, to: 0.432 },
  /** The "how we manage it" panel is DOM, not geometry. */
  structurePanel: { dom: true, from: 0.425, to: 0.455 },

  /** Ring 3 — splits into 5 angular segments, lighting in sequence.
   *  Index 4 (DTR) is centered on the dart's exit vector and lights last. */
  fitSegments: { uniform: "uSegment", from: 0.520, to: 0.600, count: 5 },

  /** Ring 4 — InstancedMesh point cloud resolving scatter -> trend line. */
  signalResolve: { uniform: "uResolve", from: 0.640, to: 0.700, instances: 2400 },

  /** Ring 5 — does NOT shatter. Aperture closes behind the camera. */
  securityAperture: { uniform: "uAperture", from: 0.755, to: 0.800 },

  /** Ring 6 — trailing light wake, no impact ceremony. */
  lastsWake: { uniform: "uWake", from: 0.820, to: 0.880 },

  /** Bullseye — flash, then geometry morphs to the Centaim mark. */
  bullFlash: { uniform: "uFlash", from: 0.918, to: 0.932 },
  logoMorph: { uniform: "uMorph", from: 0.962, to: 1.000 },
} as const;

/** Telescope: 0 = flat dartboard, 1 = fully separated tunnel. */
export const TELESCOPE = { from: 0.140, to: 0.175 } as const;

/** Board rotates face-on -> flat, rings become contact form rows.
 *  Runs in the unpinned section after p = 1. */
export const RECENTER = {
  rotateX: { fromDeg: 0, toDeg: -90 },
  overVh: 60,
} as const;

/** Post-processing, keyed to impacts only. Never ambient. */
export const FX = {
  bloom: { strength: 0.9, radius: 0.4, threshold: 0.85, halfRes: true },
  /** Chromatic fringe + radial blur, 0.012 of p on either side of each impact. */
  impactWindow: 0.012,
  impactFringe: 0.0035,
} as const;

/** Mobile deltas. Applied over the desktop config, not a separate timeline. */
export const MOBILE = {
  fov: 52,
  holdFactor: 1.45,
  leadFactor: 1.3,
  gapScale: 0.85,
  dprCap: 1.5,
  bloom: false,
  impactFringe: 0,
  /** Copy stacks are taller in portrait, so the text beats get more room.
   *  Camera depths are unchanged — only the scroll mapping stretches. */
  beatVhScale: { structure: 1.45, fit: 1.5, throw: 1.15 } as Record<string, number>,
  signalInstances: 800,
} as const;

/* -----------------------------------------------------------------------
   DERIVATION
   Everything below turns one scroll position into one scene pose. The page
   and the sandbox both go through here, so there is exactly one definition
   of what the scene looks like at a given moment.
   ----------------------------------------------------------------------- */

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Local 0..1 across a window, clamped at both ends. */
export const windowAt = (p: number, from: number, to: number) =>
  clamp01((p - from) / (to - from));

/** Smoothstep, for anything the eye reads as easing rather than tracking. */
export const smooth = (t: number) => t * t * (3 - 2 * t);

/** Camera depth at p, interpolated in log space between CAMERA_KEYS. */
export function depthAt(p: number): number {
  const keys = CAMERA_KEYS;
  if (p <= keys[0].p) return keys[0].depth;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (p <= b.p) {
      const t = smooth(windowAt(p, a.p, b.p));
      // Log space: the tunnel is geometric, so linear depth reads as
      // accelerating into a wall.
      return Math.exp(Math.log(a.depth) + (Math.log(b.depth) - Math.log(a.depth)) * t);
    }
  }
  return keys[keys.length - 1].depth;
}

/** Which ring is lit at p: the most recent one struck, until the next. */
export function activeAt(p: number): number | "bull" | null {
  let current: number | "bull" | null = null;
  for (const im of IMPACTS) {
    if (p >= im.p) current = im.ring < 0 ? "bull" : im.ring;
  }
  return current;
}

/**
 * Lateral camera offset at p.
 *
 * The flight is axial, which means anything separated ALONG the axis —
 * ring 2's exploded slabs above all — is invisible head-on. A short drift
 * off the centre line during that beat buys the parallax that makes the
 * stack readable, and keeps ten screens of straight-ahead travel from
 * feeling locked to a rail.
 */
export function driftAt(p: number): [number, number] {
  let x = 0;
  let y = 0;

  // One swing per ring beat, in the direction that moves the board AWAY
  // from that beat's copy. Even beats are written on the left, odd on the
  // right, so the sign alternates with them.
  IMPACTS.forEach(({ beat, ring }, i) => {
    if (ring < 0) return;
    const b = BEAT_RANGE[beat];
    const t = windowAt(p, b.from, b.to);
    if (t <= 0 || t >= 1) return;
    const arc = Math.sin(t * Math.PI) ** 1.3;
    // Lean toward the strike, which is the half the copy is NOT in.
    const dir = strikeSide(ring) === "right" ? -1 : 1;
    x += arc * RING_RADIUS[ring] * 0.66 * dir;
    y += arc * RING_RADIUS[ring] * 0.1;
  });

  // A trace of movement everywhere else, so the tunnel is not a rail.
  const idle = Math.sin(p * 11.3) * 1.4;

  // The ending is dead centre. A bullseye that drifts off-axis is not a
  // bullseye, and the mark has to land in the middle of the frame.
  const settle = 1 - windowAt(p, IMPACTS[IMPACTS.length - 1].p - 0.02, 0.962);
  return [(x + idle) * settle, (y + idle * 0.35) * settle];
}

export interface ScenePose {
  depth: number;
  telescope: number;
  active: number | "bull" | null;
  clip: number;
  segments: number;
  resolve: number;
  aperture: number;
  flash: number;
  launch: number;
  dartT: number;
  drift: [number, number];
  /** 0 = mark centred as the bullseye, 1 = shifted left into the lockup. */
  logoMorph: number;
  /** 1 = dart fully gone. It retires into the flash on the final impact. */
  dartFade: number;
}

/** The complete scene pose at scroll position p. */
export function poseAt(p: number): ScenePose {
  const m = MECHANISM;
  return {
    depth: depthAt(p),
    telescope: smooth(windowAt(p, TELESCOPE.from, TELESCOPE.to)),
    active: activeAt(p),
    clip: smooth(windowAt(p, m.structureClip.from, m.structureClip.to)),
    segments: windowAt(p, m.fitSegments.from, m.fitSegments.to),
    resolve: smooth(windowAt(p, m.signalResolve.from, m.signalResolve.to)),
    aperture: smooth(windowAt(p, m.securityAperture.from, m.securityAperture.to)),
    // Flash spikes and falls rather than ramping.
    flash: (() => {
      const t = windowAt(p, m.bullFlash.from, m.bullFlash.to);
      return t === 0 || t === 1 ? 0 : Math.sin(t * Math.PI) ** 1.5;
    })(),
    launch: dartLaunchAt(p),
    dartT: dartTAt(p),
    drift: driftAt(p),
    logoMorph: smooth(windowAt(p, m.logoMorph.from, m.logoMorph.to)),
    // The dart has arrived; leaving it stuck through the mark reads as a
    // stray object sitting on the logo.
    dartFade: smooth(windowAt(p, m.bullFlash.from, m.bullFlash.from + 0.016)),
  };
}

/**
 * Copy windows. Each beat's text fades in after its impact, holds, and
 * clears before the next impact so two beats are never legible at once.
 */
export function copyOpacityAt(p: number, beat: BeatId): number {
  const range = BEAT_RANGE[beat];
  const span = range.to - range.from;
  const fade = Math.min(0.022, span * 0.18);
  /*
    Copy keys off the IMPACT, not off the beat boundary. Fading in 12% of
    the way into the beat meant the dart had already punched the ring and
    moved on while the headline was still arriving — the hit and the claim
    read as two unrelated events. Now the text arrives on the strike.
  */
  const impact = IMPACTS.find((im) => im.beat === beat)?.p;
  const inAt =
    beat === "hero" ? range.from : impact !== undefined ? impact : range.from + span * 0.1;
  const outAt = range.to - span * 0.05;
  // `<=`, not `<`. At exactly p = 0 the hero fell through to the fade-in
  // window and evaluated to 0, so the very first frame of the page — the
  // one everybody sees before they touch the wheel — had no copy on it.
  if (p <= inAt) return beat === "hero" ? 1 : 0;
  if (p > outAt + fade) return 0;
  if (p > outAt) return 1 - windowAt(p, outAt, outAt + fade);
  return windowAt(p, inAt, inAt + fade);
}

export const QUALITY = {
  high: { ringSegments: 256, tubeSegments: 128, bloom: true, fringe: true },
  mid: { ringSegments: 160, tubeSegments: 72, bloom: true, fringe: false },
  low: { ringSegments: 96, tubeSegments: 40, bloom: false, fringe: false },
} as const;

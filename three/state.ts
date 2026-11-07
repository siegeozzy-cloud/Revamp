/**
 * CENTAIM — Phase 4b · Stage state
 *
 * One mutable object, created once, mutated in place every frame and read
 * by every scene component's useFrame. It never goes through React state:
 * routing a scroll position through setState re-renders the tree sixty
 * times a second to change a float.
 *
 * The sandbox mutates it from sliders; the page mutates it from scroll.
 * Both drive exactly the same scene, so a pose verified in one is the pose
 * the other produces.
 */

import type { QUALITY } from "@/storyboard/timeline";

export type QualityTier = keyof typeof QUALITY;
export type ActiveTarget = number | "bull" | null;

export interface StageState {
  /** 0 = flat dartboard, 1 = fully telescoped tunnel. */
  telescope: number;
  /** Which ring is lit. Set after that ring's impact, cleared at the next. */
  active: ActiveTarget;
  /** Ring 2: 0 = sealed stack, 1 = four slabs fully fanned apart. */
  clip: number;
  /** Ring 3: how much of the five-segment sequence has lit, 0..1. */
  segments: number;
  /** Ring 4: 0 = scattered points, 1 = resolved trend line. */
  resolve: number;
  /** Ring 5: 0 = open, 1 = aperture closed behind the camera. */
  aperture: number;
  /** Bullseye white-out, 0..1. Also masks the ring-6 crossing. */
  flash: number;

  /** Camera distance to the bullseye plane. Interpolated in log space. */
  depth: number;
  /** Dart launch progress, 0..1, before it joins the spiral. */
  launch: number;
  /** Dart spiral progress, 0..1. t = i/6 is ring i's impact. */
  dartT: number;
  /** Lateral camera offset, for parallax on axially-separated geometry. */
  drift: [number, number];
  /** 0 = mark centred as the bullseye, 1 = shifted left into the lockup. */
  logoMorph: number;
  /** 1 = dart fully gone. */
  dartFade: number;

  quality: QualityTier;
}

export function createStageState(
  overrides: Partial<StageState> = {},
): StageState {
  return {
    telescope: 0,
    active: null,
    clip: 0,
    segments: 0,
    resolve: 0,
    aperture: 0,
    flash: 0,
    depth: 469,
    launch: 0,
    dartT: 0,
    drift: [0, 0],
    logoMorph: 0,
    dartFade: 0,
    quality: "high",
    ...overrides,
  };
}

/**
 * CENTAIM — Device tier
 *
 * Picks a QUALITY tier once per load. Called from StoryStage before the
 * Canvas mounts, so the tier is fixed for the lifetime of the scene and
 * every useMemo keyed on it builds exactly once.
 *
 * Why a heuristic and not a measured frame time: by the time you have
 * measured enough frames to know the device is slow, the reader has
 * already scrolled through the hero at 20fps, and dropping the tier
 * mid-scroll rebuilds every geometry in the scene — a long hitch at the
 * worst possible moment. A phone is a phone; classify it up front.
 *
 * Bisect handle, matching DotField's ?nofield: append ?q=low, ?q=mid or
 * ?q=high to force a tier and compare on one device.
 */

import type { QualityTier } from "./state";

const TIERS: QualityTier[] = ["low", "mid", "high"];

function forced(): QualityTier | null {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search).get("q");
  return q && (TIERS as string[]).includes(q) ? (q as QualityTier) : null;
}

/**
 * The tier for this device.
 *
 * `pointer: coarse` is the signal that actually matters. Viewport width
 * alone misclassifies both ways — a narrow desktop window is not a phone,
 * and a tablet in landscape is wider than plenty of laptops — but a
 * coarse pointer means touch, and touch means a mobile GPU and a mobile
 * thermal budget.
 */
export function detectTier(): QualityTier {
  const override = forced();
  if (override) return override;
  if (typeof window === "undefined") return "low";

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency ?? 8;
  // Chromium only; absent elsewhere, so it can only ever demote.
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;

  // Phones and small tablets. The board fills the frame in portrait, so
  // this is also where overdraw hurts most.
  if (coarse && window.matchMedia("(max-width: 1024px)").matches) return "low";
  // Large touch screens: iPad Pro and friends. Real GPUs, mobile budget.
  if (coarse) return "mid";
  // Low-core or low-memory desktops — integrated graphics, old laptops.
  if (cores <= 4 || (memory !== undefined && memory <= 4)) return "mid";
  return "high";
}

/**
 * Pixel ratio actually used, as [min, max] for R3F's `dpr` prop.
 *
 * Capping matters more than any shader change on a phone: a modern handset
 * reports devicePixelRatio 3, so an uncapped canvas shades nine times the
 * fragments of a 1x one. The tier cap is combined with the real ratio so a
 * 1x screen is never upscaled.
 */
export function dprRange(cap: number): [number, number] {
  const real = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  return [1, Math.min(cap, real)];
}

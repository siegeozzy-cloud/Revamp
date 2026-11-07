"use client";

import { useEffect } from "react";
import { BEAT_RANGE, IMPACTS, type BeatId } from "@/storyboard/timeline";

/**
 * Makes in-page links work while the scroll story is running.
 *
 * The footer links to #styles, #structure and so on. Those are real
 * sections in the static page, but the stage replaces them with a single
 * pinned container — so the anchors point at elements that no longer
 * exist and clicking them does nothing.
 *
 * This maps a beat's id to the scroll position where that beat reads, and
 * scrolls there instead. It is mounted inside the stage, so when the
 * static page is showing it does not exist and native anchors work.
 */
export function BeatNav({ stage }: { stage: React.RefObject<HTMLDivElement | null> }) {
  useEffect(() => {
    /** Scroll position where a beat is fully on screen. */
    const targetFor = (id: BeatId) => {
      const el = stage.current;
      if (!el) return null;
      const range = BEAT_RANGE[id];
      if (!range) return null;

      // Land just past the impact, where the copy is up and holding —
      // not at the beat boundary, where it has not faded in yet.
      const impact = IMPACTS.find((im) => im.beat === id)?.p;
      const p =
        impact !== undefined
          ? Math.min(impact + (range.to - impact) * 0.35, range.to - 0.005)
          : range.from + (range.to - range.from) * 0.5;

      const top = el.offsetTop;
      const travel = el.offsetHeight - window.innerHeight;
      return top + travel * p;
    };

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as HTMLElement | null)?.closest?.("a");
      if (!link) return;

      // Footer links are "/#styles" so they also work from other pages;
      // in-page ones are plain "#styles". Both land here when we are home.
      const href = link.getAttribute("href") ?? "";
      const hash = href.startsWith("#")
        ? href.slice(1)
        : href.startsWith("/#") && window.location.pathname === "/"
          ? href.slice(2)
          : null;
      if (!hash) return;

      const id = hash as BeatId;
      // Anything that is still real DOM — #contact — keeps native behaviour.
      if (document.getElementById(id)) return;

      const y = targetFor(id);
      if (y === null) return;

      /*
        Capture phase, and we stop the event here. next/link's own handler
        is attached at the React root, which is BELOW document — so in the
        bubble phase it ran first, called preventDefault, and this handler
        bailed out on `defaultPrevented`. Hence links that did nothing.
      */
      e.preventDefault();
      e.stopPropagation();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
      history.replaceState(null, "", `#${hash}`);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [stage]);

  return null;
}

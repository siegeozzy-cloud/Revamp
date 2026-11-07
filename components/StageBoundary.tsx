"use client";

import { Component, type ReactNode } from "react";

/**
 * If anything inside the scroll stage throws, show the static page.
 *
 * Without this, a failure after mount takes the stage AND the fallback
 * with it, because the fallback only renders while the stage is disabled
 * — which leaves the visitor with nothing between the top of the page and
 * the contact form. A broken scene should cost the animation, never the
 * content.
 */
export class StageBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("[centaim] scroll stage failed, falling back to static:", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

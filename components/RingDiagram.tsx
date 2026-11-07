import { BULLSEYE_RADIUS, RING_RADIUS, R_OUTER } from "@/storyboard/world";

/**
 * Static poster of the board, with one ring live.
 * Pure SVG, no JavaScript. This is the no-WebGL / reduced-motion
 * stand-in for the Phase 4 canvas, and it uses the same radii as the
 * 3D scene so the two never drift apart.
 */
export function RingDiagram({
  active,
  size = 320,
  showDart = true,
  className = "",
}: {
  /** 0-indexed ring, or "bull", or null for the whole board at rest. */
  active: number | "bull" | null;
  size?: number;
  showDart?: boolean;
  className?: string;
}) {
  const VB = R_OUTER * 2.3;
  const half = VB / 2;
  const spokes = Array.from({ length: 20 }, (_, i) => (i * 360) / 20);

  // The dart sits on the live ring, entering from the upper right.
  const liveRadius =
    active === "bull"
      ? 0
      : typeof active === "number"
        ? RING_RADIUS[active]
        : null;
  const theta = (-38 * Math.PI) / 180;

  return (
    <svg
      viewBox={`${-half} ${-half} ${VB} ${VB}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={
        active === "bull"
          ? "Dartboard with the dart in the bullseye"
          : typeof active === "number"
            ? `Dartboard with the dart through ring ${active + 1} of 6`
            : "Dartboard"
      }
    >
      <defs>
        <radialGradient id="rd-face" cx="38%" cy="32%">
          <stop offset="0%" stopColor="#3e484e" />
          <stop offset="70%" stopColor="#2b3337" />
          <stop offset="100%" stopColor="#1b2225" />
        </radialGradient>
        <filter id="rd-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle r={R_OUTER * 1.1} fill="url(#rd-face)" />
      <circle
        r={R_OUTER * 1.1}
        fill="none"
        stroke="var(--color-gunmetal-rim)"
        strokeWidth={0.7}
        opacity={0.6}
      />

      {/* Radial wires */}
      <g stroke="var(--color-gunmetal-rim)" strokeWidth={0.35} opacity={0.4}>
        {spokes.map((deg) => {
          const r = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={Math.cos(r) * BULLSEYE_RADIUS}
              y1={Math.sin(r) * BULLSEYE_RADIUS}
              x2={Math.cos(r) * R_OUTER}
              y2={Math.sin(r) * R_OUTER}
            />
          );
        })}
      </g>

      {/* Rings, outside -> in */}
      {RING_RADIUS.map((r, i) => {
        const isLive = active === i;
        return (
          <circle
            key={r}
            r={r}
            fill="none"
            stroke={isLive ? "var(--color-aim-live)" : "var(--color-gunmetal-rim)"}
            strokeWidth={isLive ? 2.2 : 0.9}
            opacity={isLive ? 1 : 0.45}
            filter={isLive ? "url(#rd-glow)" : undefined}
          />
        );
      })}

      {/* Bullseye */}
      <circle
        r={BULLSEYE_RADIUS}
        fill={active === "bull" ? "var(--color-aim)" : "var(--color-gunmetal-deep)"}
        stroke={active === "bull" ? "var(--color-aim-live)" : "var(--color-gunmetal-rim)"}
        strokeWidth={active === "bull" ? 1.6 : 0.8}
        filter={active === "bull" ? "url(#rd-glow)" : undefined}
      />

      {/* Dart: shaft entering from upper right, tip on the live ring */}
      {showDart && active !== null && liveRadius !== null && (
        <g
          stroke="var(--color-paper)"
          strokeWidth={1.1}
          strokeLinecap="round"
          filter="url(#rd-glow)"
        >
          <line
            x1={Math.cos(theta) * (liveRadius + 20)}
            y1={Math.sin(theta) * (liveRadius + 20)}
            x2={Math.cos(theta) * (liveRadius + 1)}
            y2={Math.sin(theta) * (liveRadius + 1)}
          />
          <circle
            cx={Math.cos(theta) * liveRadius}
            cy={Math.sin(theta) * liveRadius}
            r={1.7}
            fill="var(--color-aim-live)"
            stroke="none"
          />
        </g>
      )}
    </svg>
  );
}

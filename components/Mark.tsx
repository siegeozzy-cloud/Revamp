/**
 * The Centaim mark, as vector.
 *
 * Traced from the supplied logo: an open C with ball terminals, a centre
 * node, and a second node sitting in the opening, joined by a neck. The C
 * is a stroked arc rather than a filled shape, which gets the round
 * terminals for free and keeps the whole mark to four primitives.
 *
 * This is the crisp version used wherever the mark is UI — the final
 * lockup, the footer, the static page. three/geometry.ts rebuilds the
 * same proportions as extruded 3D for the bullseye at the end of the
 * tunnel. If the real .svg ever lands, replace the path data here and
 * mirror the numbers in MARK over there.
 */
export function Mark({
  className = "",
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="-106 -106 212 212"
      className={className}
      fill="none"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {/* The C: mid-radius 82.5, stroke 35, from 76° round to 332°. */}
      <path
        d="M 19.96 -80.05 A 82.5 82.5 0 1 0 72.84 38.72"
        stroke="currentColor"
        strokeWidth="35"
        strokeLinecap="round"
      />
      {/*
        The neck. NOT a straight bar — the two nodes join the way cells
        do, with the edges curving concavely into each circle so the pair
        reads as one body pinching in the middle. The control points are
        pulled 78% of the way onto the centre line, which is what makes
        the waist narrower than the gap between the two circles — at a
        gentler pull the join just looks like a thick bar. The ends of
        this path are chords hidden under the two circles drawn over it.
      */}
      <path
        d="M 14.91 21.30
           C 16.85 -5.22, 34.95 -18.42, 57.92 -14.92
           L 33.82 -49.32
           C 29.27 -26.53, 10.67 -14.06, -14.91 -21.30 Z"
        fill="currentColor"
      />
      <circle cx="0" cy="0" r="26" fill="currentColor" />
      <circle cx="45.87" cy="-32.12" r="21" fill="currentColor" />
    </svg>
  );
}

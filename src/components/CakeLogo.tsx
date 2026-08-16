/**
 * The cake tracker's mark: a two-tier cake with wavy icing on each layer
 * and a stemmed cherry on top, standing in for the plain lucide `CakeIcon`
 * everywhere the app needs an actual logo rather than a UI icon — the
 * header badge, the loading splash, the login screen, the empty state.
 * Same 24×24 viewBox as lucide, so it drops into the same size classes
 * (`size-6`, `size-9`, …) as every lucide icon in the app.
 *
 * Unlike a lucide-style line icon, this mark is inherently multi-color
 * (yellow sponge, white icing, a coral cherry) rather than a single
 * `currentColor` silhouette, so only the outline/ink lines use
 * `currentColor` — that's what lets the mark sit legibly on both the dark
 * "primary" tile (light mode's header/splash/login badge) and the light
 * tile dark mode flips that badge to, exactly like the cherry on the old
 * cupcake mark stayed a fixed color while the cup and frosting tinted.
 * The cake body, icing, and cherry stay fixed hex values so the mark
 * reads as the same cake everywhere.
 */
export default function CakeLogo({
  className,
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      {/* Bottom tier */}
      <rect x="2.7" y="14.3" width="18.6" height="6.4" rx="1.7" fill="#FDE94C" />
      <path
        d="M 2.70 16.00 A 1.70 1.70 0 0 1 4.40 14.30 L 19.60 14.30 A 1.70 1.70 0 0 1 21.30 16.00 L 21.30 16.85 L 20.68 17.20 L 20.06 17.42 L 19.44 17.42 L 18.82 17.20 L 18.20 16.85 L 17.58 16.50 L 16.96 16.28 L 16.34 16.28 L 15.72 16.50 L 15.10 16.85 L 14.48 17.20 L 13.86 17.42 L 13.24 17.42 L 12.62 17.20 L 12.00 16.85 L 11.38 16.50 L 10.76 16.28 L 10.14 16.28 L 9.52 16.50 L 8.90 16.85 L 8.28 17.20 L 7.66 17.42 L 7.04 17.42 L 6.42 17.20 L 5.80 16.85 L 5.18 16.50 L 4.56 16.28 L 3.94 16.28 L 3.32 16.50 L 2.70 16.85 Z"
        fill="#FFFBEF"
      />
      <path
        d="M 2.70 16.85 L 3.32 16.50 L 3.94 16.28 L 4.56 16.28 L 5.18 16.50 L 5.80 16.85 L 6.42 17.20 L 7.04 17.42 L 7.66 17.42 L 8.28 17.20 L 8.90 16.85 L 9.52 16.50 L 10.14 16.28 L 10.76 16.28 L 11.38 16.50 L 12.00 16.85 L 12.62 17.20 L 13.24 17.42 L 13.86 17.42 L 14.48 17.20 L 15.10 16.85 L 15.72 16.50 L 16.34 16.28 L 16.96 16.28 L 17.58 16.50 L 18.20 16.85 L 18.82 17.20 L 19.44 17.42 L 20.06 17.42 L 20.68 17.20 L 21.30 16.85"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="2.7"
        y="14.3"
        width="18.6"
        height="6.4"
        rx="1.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Top tier */}
      <rect x="7.2" y="9.3" width="9.6" height="5.3" rx="1.3" fill="#FDE94C" />
      <path
        d="M 7.20 10.60 A 1.30 1.30 0 0 1 8.50 9.30 L 15.50 9.30 A 1.30 1.30 0 0 1 16.80 10.60 L 16.80 11.55 L 16.32 11.87 L 15.84 12.07 L 15.36 12.07 L 14.88 11.87 L 14.40 11.55 L 13.92 11.23 L 13.44 11.03 L 12.96 11.03 L 12.48 11.23 L 12.00 11.55 L 11.52 11.87 L 11.04 12.07 L 10.56 12.07 L 10.08 11.87 L 9.60 11.55 L 9.12 11.23 L 8.64 11.03 L 8.16 11.03 L 7.68 11.23 L 7.20 11.55 Z"
        fill="#FFFBEF"
      />
      <path
        d="M 7.20 11.55 L 7.68 11.23 L 8.16 11.03 L 8.64 11.03 L 9.12 11.23 L 9.60 11.55 L 10.08 11.87 L 10.56 12.07 L 11.04 12.07 L 11.52 11.87 L 12.00 11.55 L 12.48 11.23 L 12.96 11.03 L 13.44 11.03 L 13.92 11.23 L 14.40 11.55 L 14.88 11.87 L 15.36 12.07 L 15.84 12.07 L 16.32 11.87 L 16.80 11.55"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="7.2"
        y="9.3"
        width="9.6"
        height="5.3"
        rx="1.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Cherry stem */}
      <path
        d="M 12.7 5.5 C 12.7 4.3 13.3 3.6 14.5 3.5"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        fill="none"
      />
      {/* Cherry */}
      <circle cx="12.4" cy="6.6" r="1.35" fill="currentColor" />
      <circle cx="12.15" cy="6.95" r="0.9" fill="#EA5A46" />
    </svg>
  );
}

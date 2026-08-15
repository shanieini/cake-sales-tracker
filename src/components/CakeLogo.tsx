/**
 * The cake tracker's mark: a cupcake with a swirl of frosting and a cherry
 * on top, standing in for the plain lucide `CakeIcon` everywhere the app
 * needs an actual logo rather than a UI icon — the header badge, the
 * loading splash, the empty states. Same 24×24 viewBox as lucide, so it
 * drops into the same size classes (`size-5`, `size-9`, …) as every lucide
 * icon in the app.
 *
 * The cup and frosting use `currentColor`, so the mark tints via `text-*`
 * exactly like a lucide icon does — the cherry stays a fixed warm color
 * (a real cherry doesn't change with the theme either).
 */
export default function CakeLogo({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      {/* Base shadow */}
      <ellipse cx="12" cy="21" rx="6.4" ry="0.9" fill="currentColor" opacity="0.18" />
      {/* Fluted cup */}
      <path
        d="M6.3 13.5 L17.7 13.5 L16.2 20.3 a1.3 1.3 0 0 1-1.3 1.1H9.1a1.3 1.3 0 0 1-1.3-1.1L6.3 13.5Z"
        fill="currentColor"
      />
      {/* Cup flutes */}
      <path
        d="M8.6 14.6 8.1 19.6M12 14.6 12 19.9M15.4 14.6 15.9 19.6"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.32"
      />
      {/* Frosting swirl */}
      <path
        d="M6.3 13.5C6 9.6 8 8.4 9 9.6 9.6 7 11 6.6 12 8 13 6.6 14.4 7 15 9.6 16 8.4 18 9.6 17.7 13.5Z"
        fill="currentColor"
        opacity="0.88"
      />
      {/* Cherry */}
      <circle cx="12" cy="6.5" r="1.15" fill="#b3524a" />
    </svg>
  );
}

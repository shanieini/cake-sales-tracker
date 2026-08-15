/**
 * The cake tracker's mark: a two-tier cake with a lit candle, standing in
 * for the plain lucide `CakeIcon` everywhere the app needs an actual logo
 * rather than a UI icon — the header badge, the loading splash, the empty
 * states. Same 24×24 viewBox as lucide, so it drops into the same size
 * classes (`size-5`, `size-9`, …) as every lucide icon in the app.
 *
 * The cake body and candle use `currentColor`, so it tints via `text-*`
 * exactly like a lucide icon does — the flame stays a fixed warm color
 * (a candle flame doesn't change with the theme).
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
      {/* Flame */}
      <path
        d="M12 2.5c1.1 1.1 1.6 2 1.6 2.9a1.6 1.6 0 1 1-3.2 0c0-.9.5-1.8 1.6-2.9Z"
        fill="#f4a13a"
      />
      {/* Candle */}
      <rect x="11.1" y="6.1" width="1.8" height="3.4" rx="0.5" fill="currentColor" />
      {/* Top tier */}
      <path
        d="M6.7 10.4c0-.7.5-1.2 1.4-1.6 1-.4 2.4-.6 3.9-.6s2.9.2 3.9.6c.9.4 1.4.9 1.4 1.6v2.1H6.7v-2.1Z"
        fill="currentColor"
      />
      {/* Frosting drip, top tier */}
      <path
        d="M6.7 12c.5.6.9.6 1.3 0 .5-.6.9-.6 1.3 0 .5.6.9.6 1.3 0 .5-.6.9-.6 1.3 0 .5.6.9.6 1.3 0 .5-.6.9-.6 1.3 0 .5.6.9.6 1.3 0v1.1H6.7V12Z"
        fill="currentColor"
        opacity="0.55"
      />
      {/* Bottom tier */}
      <path
        d="M3.4 15.7c0-.8.7-1.5 2-1.9 1.3-.5 3.2-.8 5.4-.8s4.1.3 5.4.8c1.3.4 2 1.1 2 1.9v3.9a1 1 0 0 1-1 1H4.4a1 1 0 0 1-1-1v-3.9Z"
        fill="currentColor"
      />
      {/* Frosting drip, bottom tier */}
      <path
        d="M3.4 17.3c.6.7 1.1.7 1.6 0 .6-.7 1.1-.7 1.6 0 .6.7 1.1.7 1.6 0 .6-.7 1.1-.7 1.6 0 .6.7 1.1.7 1.6 0 .6-.7 1.1-.7 1.6 0 .6.7 1.1.7 1.6 0v1.5H3.4v-1.5Z"
        fill="currentColor"
        opacity="0.55"
      />
      {/* Base shadow */}
      <rect x="3.2" y="20.3" width="17.6" height="1.2" rx="0.6" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

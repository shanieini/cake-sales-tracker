/**
 * The cake mark (see `src/components/CakeLogo.tsx`), redrawn as plain
 * elements for `ImageResponse` (next/og) rather than a React component —
 * favicon/apple-touch-icon/manifest icons all render server-side via
 * Satori, which doesn't see Tailwind classes or `globals.css`'s CSS
 * variables, so the tile gradient and mark colors are the same hexes
 * spelled out again here rather than imported.
 *
 * These icon surfaces render once, statically, always on the dark
 * "primary" tile — there's no light/dark flip to react to the way the
 * in-app `CakeLogo` has via `currentColor`, so the outline/ink lines are
 * hardcoded to the cream that `currentColor` would resolve to against
 * this tile (see CakeLogo's doc comment for why the outline needs a
 * light color here at all: a near-black outline on this near-black tile
 * disappears). The cake body, icing, and cherry stay the same fixed hexes
 * as the in-app mark either way.
 *
 * One component backs every icon surface (`icon.tsx`, `apple-icon.tsx`,
 * `icons/[size]/route.tsx`, `icons/maskable/route.tsx`) so the tab favicon,
 * the iOS home-screen icon, and the installed-app icon all match the mark
 * used everywhere inside the app itself.
 */
const INK = "#F3ECDC";

export function AppIconTile({
  size,
  radius = 0,
  markRatio = 0.56,
}: {
  size: number;
  radius?: number;
  markRatio?: number;
}) {
  const mark = Math.round(size * markRatio);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1c1a17, #35322c)",
      }}
    >
      <svg width={mark} height={mark} viewBox="0 0 24 24" fill="none">
        {/* Bottom tier */}
        <rect x="2.7" y="14.3" width="18.6" height="6.4" rx="1.7" fill="#FDE94C" />
        <path
          d="M 2.70 16.00 A 1.70 1.70 0 0 1 4.40 14.30 L 19.60 14.30 A 1.70 1.70 0 0 1 21.30 16.00 L 21.30 16.85 L 20.68 17.20 L 20.06 17.42 L 19.44 17.42 L 18.82 17.20 L 18.20 16.85 L 17.58 16.50 L 16.96 16.28 L 16.34 16.28 L 15.72 16.50 L 15.10 16.85 L 14.48 17.20 L 13.86 17.42 L 13.24 17.42 L 12.62 17.20 L 12.00 16.85 L 11.38 16.50 L 10.76 16.28 L 10.14 16.28 L 9.52 16.50 L 8.90 16.85 L 8.28 17.20 L 7.66 17.42 L 7.04 17.42 L 6.42 17.20 L 5.80 16.85 L 5.18 16.50 L 4.56 16.28 L 3.94 16.28 L 3.32 16.50 L 2.70 16.85 Z"
          fill="#FFFBEF"
        />
        <path
          d="M 2.70 16.85 L 3.32 16.50 L 3.94 16.28 L 4.56 16.28 L 5.18 16.50 L 5.80 16.85 L 6.42 17.20 L 7.04 17.42 L 7.66 17.42 L 8.28 17.20 L 8.90 16.85 L 9.52 16.50 L 10.14 16.28 L 10.76 16.28 L 11.38 16.50 L 12.00 16.85 L 12.62 17.20 L 13.24 17.42 L 13.86 17.42 L 14.48 17.20 L 15.10 16.85 L 15.72 16.50 L 16.34 16.28 L 16.96 16.28 L 17.58 16.50 L 18.20 16.85 L 18.82 17.20 L 19.44 17.42 L 20.06 17.42 L 20.68 17.20 L 21.30 16.85"
          stroke={INK}
          strokeWidth={1.15}
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
          stroke={INK}
          strokeWidth={1.6}
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
          stroke={INK}
          strokeWidth={1.1}
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
          stroke={INK}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />

        {/* Cherry stem */}
        <path
          d="M 12.7 5.5 C 12.7 4.3 13.3 3.6 14.5 3.5"
          stroke={INK}
          strokeWidth={1.05}
          strokeLinecap="round"
          fill="none"
        />
        {/* Cherry */}
        <circle cx="12.4" cy="6.6" r="1.35" fill={INK} />
        <circle cx="12.15" cy="6.95" r="0.9" fill="#EA5A46" />
      </svg>
    </div>
  );
}

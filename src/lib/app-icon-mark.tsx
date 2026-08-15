/**
 * The cupcake mark (see `src/components/CakeLogo.tsx`), redrawn as plain
 * elements for `ImageResponse` (next/og) rather than a React component —
 * favicon/apple-touch-icon/manifest icons all render server-side via
 * Satori, which doesn't see Tailwind classes or `globals.css`'s CSS
 * variables, so the black gradient and mark colors are the same hexes
 * spelled out again here rather than imported.
 *
 * One component backs every icon surface (`icon.tsx`, `apple-icon.tsx`,
 * `icons/[size]/route.tsx`, `icons/maskable/route.tsx`) so the tab favicon,
 * the iOS home-screen icon, and the installed-app icon all match the mark
 * used everywhere inside the app itself.
 */
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
        {/* Fluted cup */}
        <path
          d="M6.3 13.5 L17.7 13.5 L16.2 20.3 a1.3 1.3 0 0 1-1.3 1.1H9.1a1.3 1.3 0 0 1-1.3-1.1L6.3 13.5Z"
          fill="#f3ecdc"
        />
        {/* Cup flutes */}
        <path
          d="M8.6 14.6 8.1 19.6M12 14.6 12 19.9M15.4 14.6 15.9 19.6"
          stroke="#f3ecdc"
          strokeWidth={1}
          strokeLinecap="round"
          opacity={0.32}
        />
        {/* Frosting swirl */}
        <path
          d="M6.3 13.5C6 9.6 8 8.4 9 9.6 9.6 7 11 6.6 12 8 13 6.6 14.4 7 15 9.6 16 8.4 18 9.6 17.7 13.5Z"
          fill="#f3ecdc"
          opacity={0.88}
        />
        {/* Cherry */}
        <circle cx="12" cy="6.5" r="1.15" fill="#b3524a" />
      </svg>
    </div>
  );
}

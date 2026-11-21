/**
 * An egg, for the "sale logged" celebration popup (`SaleCelebration`).
 * Drawn the same way as `CakeLogo`: the 24×24 lucide grid, fixed fills
 * (cream shell, a warmer shadow side, a white highlight) and a
 * `currentColor` outline. The outline is what keeps it legible in both
 * themes: on light mode's dark tile it's cream and simply merges into the
 * shell, and on dark mode's cream tile it turns dark and draws the egg's
 * edge.
 */
export default function EggLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2.6C8.3 2.6 5.3 8.6 5.3 13.6C5.3 17.9 8.3 21 12 21C15.7 21 18.7 17.9 18.7 13.6C18.7 8.6 15.7 2.6 12 2.6Z"
        fill="#FFFBEF"
      />
      {/* Shadow side */}
      <path
        d="M15.9 7.6C17.5 9.6 18.3 11.8 18.3 13.7C18.3 17.4 15.6 20.4 12.2 20.6C15.1 19.3 16.9 16.5 16.9 13.3C16.9 11.4 16.6 9.4 15.9 7.6Z"
        fill="#E4D9BB"
      />
      {/* Highlight */}
      <ellipse
        cx="9.2"
        cy="8.9"
        rx="1"
        ry="2.1"
        transform="rotate(24 9.2 8.9)"
        fill="#FFFFFF"
      />
      <path
        d="M12 2.6C8.3 2.6 5.3 8.6 5.3 13.6C5.3 17.9 8.3 21 12 21C15.7 21 18.7 17.9 18.7 13.6C18.7 8.6 15.7 2.6 12 2.6Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

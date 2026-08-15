import CakeLogo from "@/components/CakeLogo";
import { cakeStrings } from "@/lib/strings";

/**
 * The branded loader shown while the app itself boots, and (via
 * SplashOverlay) held over every full page load so a slow first paint
 * doesn't show as a blank frame.
 *
 * Pure CSS (keyframes in globals.css), so it paints with the first HTML and
 * costs no client JS — a loader that needed hydrating would arrive after the
 * wait it's meant to cover. It sits on the same radial gradient as the rest
 * of the app, so the real page dissolves out of it rather than replacing it.
 */
export default function AppSplash() {
  return (
    <div
      role="status"
      aria-label="טוען"
      className="flex flex-1 flex-col items-center justify-center gap-9 overflow-hidden bg-[radial-gradient(circle_at_top,var(--primary-tint),var(--background)_55%)]"
    >
      <div className="relative flex items-center justify-center">
        {/* Sonar rings radiating off the mark. */}
        <span className="splash-ring" />
        <span className="splash-ring [animation-delay:0.9s]" />
        <span className="splash-ring [animation-delay:1.8s]" />

        <div className="splash-mark relative flex size-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-[0_18px_40px_-12px_color-mix(in_srgb,var(--primary)_60%,transparent)] ring-1 ring-white/25 ring-inset">
          <CakeLogo className="size-10" />
        </div>
      </div>

      <div className="splash-caption flex flex-col items-center gap-3.5">
        <p className="text-lg font-semibold tracking-tight">
          {cakeStrings.title}
        </p>
        <div className="h-1 w-28 overflow-hidden rounded-full bg-foreground/10">
          <div className="splash-bar h-full w-1/2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

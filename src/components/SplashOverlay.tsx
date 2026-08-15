import AppSplash from "@/components/AppSplash";

/**
 * The splash held over the app on every full load, so it's always seen
 * rather than flashing for whatever fraction of a second the server
 * happened to take.
 *
 * It dismisses itself on a CSS timer — no client JS, no hydration, no state.
 * That matters for a thing that covers the whole app: a JS-driven overlay
 * that failed to hydrate would trap the user behind it, whereas this can
 * only fail to appear. It lives in the root layout, so it plays on document
 * load (opening the app, a deep link, a refresh) and stays out of the way
 * of client-side navigation between pages.
 *
 * Timing lives in `--splash-hold` / `--splash-fade` in globals.css.
 */
export default function SplashOverlay() {
  // aria-hidden: it's a timed decoration over content that has already
  // rendered, and loading.tsx's own splash is the one that should announce a
  // real wait. Two "Loading" statuses racing would just talk over each other.
  return (
    <div className="splash-overlay" aria-hidden>
      <AppSplash />
    </div>
  );
}

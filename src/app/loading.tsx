import AppSplash from "@/components/AppSplash";

/**
 * Shown while a route segment is loading — a full document load waits on
 * SplashOverlay in the root layout instead; this one covers client-side
 * navigation and Suspense boundaries.
 */
export default function Loading() {
  return <AppSplash />;
}

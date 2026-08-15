"use client";

import LoginScreen from "@/components/LoginScreen";
import { useIsLoggedIn } from "@/lib/auth";

/**
 * Gates the whole app behind the one-account login in `src/lib/auth.ts`.
 * Lives in the root layout, outside `KeyboardInset`/`SplashOverlay` (those
 * are page-independent chrome, not app content), so every route — the
 * tracker, the report, expenses — sits behind it rather than gating each
 * page individually.
 */
export default function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const loggedIn = useIsLoggedIn();
  if (!loggedIn) return <LoginScreen />;
  return <>{children}</>;
}

"use client";

import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { migrateLegacyLocalData } from "./migrate-legacy-data";
import { setStoresUser } from "./store";
import { cakeStrings as s } from "./strings";
import { getSupabaseClient } from "./supabase/client";

// Real accounts now live in Supabase Auth (see supabase/schema.sql for the
// data side, and the README for how the admin adds a new account — there's
// no self-serve sign-up screen here, on purpose: the admin creates each
// account directly in the Supabase dashboard). Supabase's password auth
// wants an email, but this app's login form only ever asked for a plain
// username — rather than change that UX, usernames are mapped to a
// synthetic address on a domain nobody sends real mail to or needs to
// verify.
const EMAIL_DOMAIN = "cake-sales-tracker.local";

function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${EMAIL_DOMAIN}`;
}

let user: User | null = null;
let initialized = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function setUser(next: User | null) {
  const wasLoggedOut = user === null;
  user = next;
  notify();
  setStoresUser(next?.id ?? null);
  if (next && wasLoggedOut) {
    // Fire-and-forget: never blocks the UI on the migration finishing, and
    // failures are retried on the next login rather than surfaced here.
    void migrateLegacyLocalData(next.id);
  }
}

function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  const supabase = getSupabaseClient();
  // Also fires once immediately with whatever session Supabase already has
  // persisted (or null), so there's no separate `getSession()` call needed
  // just to get the initial state.
  supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });
}

function subscribe(callback: () => void) {
  ensureInitialized();
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): User | null {
  return user;
}

// No server-side session here (this runs entirely client-side against
// Supabase), so the server snapshot is always "logged out"; the client
// re-renders once with the real session right after mount, same as every
// other store in this app.
function getServerSnapshot(): User | null {
  return null;
}

/**
 * Whether someone is currently logged in. Backed by Supabase's own session
 * (which persists itself across reloads/restarts), exposed the same
 * `useSyncExternalStore` way as every other store in this app.
 */
export function useIsLoggedIn(): boolean {
  return (
    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) !== null
  );
}

/**
 * Signs in against Supabase Auth. Returns `null` on success, or a Hebrew
 * error message to show the user otherwise.
 */
export async function login(
  username: string,
  password: string,
): Promise<string | null> {
  if (!username.trim() || !password) return s.errorLogin;
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });
  return error ? s.errorLogin : null;
}

export async function logout(): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
}

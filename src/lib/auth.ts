"use client";

import { useSyncExternalStore } from "react";

const AUTH_KEY = "cake-sales:auth:v1";

// A single hardcoded account. This app has no backend to check credentials
// against — see the README — so there's nothing to authenticate against but
// this. That makes it a UI gate, not real access control: the password ships
// in the client bundle, so anyone with dev tools can read it. Fine for one
// baker keeping her own phone's app out of casual reach; don't reuse this
// pattern for anything that needs to keep data actually private.
const USERNAME = "ido";
const PASSWORD = "1234";

const listeners = new Set<() => void>();

function read(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(AUTH_KEY) === "1";
  } catch {
    // Storage disabled (private mode) — treat as logged out rather than
    // crashing the app.
    return false;
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  // Keeps multiple tabs (e.g. phone + desktop open at once) in sync: log out
  // in one, the other drops back to the login screen too.
  function onStorage(event: StorageEvent) {
    if (event.key === AUTH_KEY) callback();
  }
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

// No server-side session here (this app has no backend), so the server
// snapshot is always "logged out"; the client re-renders once with the real
// value right after mount, same as every other store in this app.
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Whether the one baker is currently logged in. Backed by `localStorage`
 * (not a plain in-memory flag), so it stays true across reloads and browser
 * restarts — the whole point being "stay logged in until logout", not
 * "logged in for this tab session".
 */
export function useIsLoggedIn(): boolean {
  return useSyncExternalStore(subscribe, read, getServerSnapshot);
}

/**
 * Checks the given credentials against the one hardcoded account. On a
 * match, persists the logged-in flag and returns true; otherwise leaves
 * state untouched and returns false so the caller can show an error.
 */
export function login(username: string, password: string): boolean {
  if (username.trim() !== USERNAME || password !== PASSWORD) return false;
  try {
    window.localStorage.setItem(AUTH_KEY, "1");
  } catch {
    // Storage disabled — the flag won't survive a reload, but this tab's
    // listeners still fire below so login "succeeds" for the current tab.
  }
  listeners.forEach((listener) => listener());
  return true;
}

export function logout(): void {
  try {
    window.localStorage.removeItem(AUTH_KEY);
  } catch {
    // ignore
  }
  listeners.forEach((listener) => listener());
}

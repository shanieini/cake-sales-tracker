import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// @testing-library/react's own auto-cleanup only self-registers when it
// detects vitest's *global* test APIs; this project imports `describe`/
// `it`/`afterEach` explicitly instead of using `globals: true` (see
// vitest.config.ts), so without this, each component test's rendered DOM
// leaks into the next test in the same file instead of being unmounted.
afterEach(cleanup);

// jsdom doesn't implement ResizeObserver (base-ui's Select popup positioning
// uses it via floating-ui), so component tests that render a Select need a
// stand-in or they throw on mount.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub;

// jsdom doesn't implement matchMedia either, and useIsDesktop (the
// mobile-Drawer-vs-desktop-Dialog switch every add/edit sheet uses) calls
// it unconditionally on every render. Reports "not desktop" — matches the
// Drawer path, which is what these tests exercise.
globalThis.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;

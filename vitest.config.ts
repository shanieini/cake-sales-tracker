import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    // jsdom, not the default "node" environment: some tests (AddSaleSheet's
    // regression test for the stale-cake-type-on-edit bug) render real
    // React components with @testing-library/react, which needs a DOM.
    // Pure-logic tests (summarize.ts, validate-cake-type.ts) run fine under
    // it too — the suite is small enough that this isn't a speed concern.
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

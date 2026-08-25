import { defineConfig, devices } from "@playwright/test";

// E2E test suite driving the real running app (started separately via
// `npm run start` against the local MySQL dev DB) - not a Playwright MCP
// session, but the same real-browser testing goal.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // tests share DB state (seeded users/courses) - keep sequential
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  // A single desktop project for the functional suite - helpers.ts assumes
  // the desktop nav is visible. responsive.spec.ts sets its own mobile
  // viewport per-test instead of duplicating the whole suite at another
  // breakpoint (which would fail on unrelated desktop-nav assumptions).
  projects: [{ name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } }],
});

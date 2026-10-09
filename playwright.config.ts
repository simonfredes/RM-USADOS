import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "mobile-chromium", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
    { name: "tablet-chromium", use: { browserName: "chromium", viewport: { width: 768, height: 1024 } } },
    { name: "desktop-chromium", use: { browserName: "chromium", viewport: { width: 1440, height: 900 } } },
    { name: "mobile-webkit", use: { ...devices["iPhone 13"], browserName: "webkit", viewport: { width: 390, height: 844 } } },
  ],
  webServer: [
    { command: "node tests/catalog-server.mjs", url: "http://127.0.0.1:54329/__fixtures", reuseExistingServer: false },
    { command: "npm run dev -- --port 3100", url: "http://localhost:3100", reuseExistingServer: false, timeout: 120_000,
      env: { RM_BUILD_DIR: ".next-tests", NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54329", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fixture-public-key", NEXT_TELEMETRY_DISABLED: "1" },
    },
  ],
});

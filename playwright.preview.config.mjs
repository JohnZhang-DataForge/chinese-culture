import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PREVIEW_SITE_URL;
if (!baseURL) throw new Error("PREVIEW_SITE_URL must point to the deployed Pages preview branch.");

const parsed = new URL(baseURL);
if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".chinese-culture-79h.pages.dev")) {
  throw new Error("PREVIEW_SITE_URL must use this project's HTTPS Pages preview domain.");
}

export default defineConfig({
  testDir: "./tests/preview-browser",
  fullyParallel: true,
  forbidOnly: true,
  retries: 1,
  reporter: "list",
  timeout: 30000,
  expect: { timeout: 10000 },
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [{ name: "chromium-preview", use: { ...devices["Desktop Chrome"] } }]
});

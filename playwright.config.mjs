import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  timeout: 30000,
  expect: { timeout: 7000 },
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    url: "http://127.0.0.1:4321/admin/",
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});

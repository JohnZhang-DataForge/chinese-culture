import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4321";
const useLocalPreview = !process.env.QA_BASE_URL;
const accessJwt = process.env.QA_ACCESS_JWT;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  outputDir: "test-results/playwright",
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["junit", { outputFile: "test-results/e2e-junit.xml" }]
  ],
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ...(accessJwt ? { extraHTTPHeaders: { "Cf-Access-Jwt-Assertion": accessJwt } } : {})
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  ...(useLocalPreview
    ? {
        webServer: {
          command: "npm run preview -- --host 127.0.0.1 --port 4321",
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 60_000,
          stdout: "ignore",
          stderr: "pipe"
        }
      }
    : {})
});

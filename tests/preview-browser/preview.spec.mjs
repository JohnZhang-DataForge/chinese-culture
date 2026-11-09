import { test, expect } from "@playwright/test";

test("deployed preview serves all public locales", async ({ page }) => {
  for (const [path, language] of [
    ["/en/", "en"],
    ["/zh-cn/", "zh-CN"],
    ["/es/", "es"]
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path + " should be available").toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    expect((await page.title()).trim().length).toBeGreaterThan(0);
  }
});

test("preview Admin is production-built and contains no demo content", async ({ page, request }) => {
  const sessionResponsePromise = page.waitForResponse((response) =>
    response.url().endsWith("/api/admin/v1/session")
  );
  const response = await page.goto("/admin/");
  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  await expect(page.locator("[data-admin-app]")).toHaveAttribute("data-demo", "false");
  const sessionResponse = await sessionResponsePromise;
  expect(sessionResponse.status()).toBe(401);
  const problem = await sessionResponse.json();
  expect(problem.code).toBe("unauthorized");
  await expect(page.locator("[data-connection-status]")).toHaveText("Authentication required");
  await expect(page.getByText("Sign in with the authorized Cloudflare Access account", { exact: false })).toBeVisible();
  await expect(page.locator("[data-content-rows]")).not.toContainText("Journey to the West");
});

test("preview API rejects unauthenticated CMS access when preview secrets are absent", async ({ request }) => {
  const response = await request.get("/api/admin/v1/session", {
    headers: { accept: "application/problem+json" }
  });
  expect(response.status()).toBe(401);
  expect((await response.json()).code).toBe("admin_api_not_configured");
});

import { test, expect } from "@playwright/test";

const publicRoutes = [
  { path: "/", name: "home" },
  { path: "/about/", name: "about" },
  { path: "/learn/", name: "learning guides" },
  { path: "/culture/", name: "culture articles" },
  { path: "/festivals/", name: "festivals" },
  { path: "/books/", name: "books" },
  { path: "/events/", name: "events" },
  { path: "/privacy/", name: "privacy" },
  { path: "/accessibility/", name: "accessibility" },
  { path: "/editorial-policy/", name: "editorial policy" },
  { path: "/contact/", name: "contact" }
];

test.describe("public website route smoke tests", () => {
  for (const route of publicRoutes) {
    test(`${route.name} route renders`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response, `No HTTP response for ${route.path}`).not.toBeNull();
      expect(response!.status(), `${route.path} returned HTTP ${response!.status()}`).toBeLessThan(400);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("main h1").first()).toBeVisible();
    });
  }

  test("unknown URL renders a real 404 page", async ({ page }) => {
    const response = await page.goto("/__qa_missing_route_6f47b3__/");
    expect(response?.status()).toBe(404);
    await expect(page.locator("main h1").first()).toBeVisible();
  });

  test("homepage has a title, description and document language", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Chinese Culture/i);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /\S+/);
    await expect(page.locator("html")).toHaveAttribute("lang", /^(en|zh)(-|$)/);
  });

  test("skip link is the first keyboard destination and targets main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skipLink = page.locator("a.skip-link");
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  test("primary navigation exposes the main content sections", async ({ page }) => {
    await page.goto("/");
    const navigation = page.getByRole("navigation").first();
    await expect(navigation).toBeVisible();
    for (const label of ["Learn", "Culture", "Festivals", "Books", "Events", "About"]) {
      await expect(navigation.getByRole("link", { name: new RegExp(label, "i") }).first()).toBeVisible();
    }
  });
});

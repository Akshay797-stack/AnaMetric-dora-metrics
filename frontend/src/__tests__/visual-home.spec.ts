import { test, expect } from "@playwright/test";

test.describe("Visual regression: Home page", () => {
  test("should match the visual snapshot (light mode)", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector(".grafana-navbar");
    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot(
      "home-light.png"
    );
  });

  test("should match the visual snapshot (dark mode)", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForSelector(".grafana-navbar");
    // Toggle theme
    await page.getByLabel("Switch to dark theme").click();
    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot(
      "home-dark.png"
    );
  });
});

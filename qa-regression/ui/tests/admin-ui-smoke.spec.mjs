import { test, expect } from "@playwright/test";

const ADMIN_APP_URL = process.env.ADMIN_APP_URL ?? "http://localhost:3001";
const ADMIN_UI_EMAIL = process.env.ADMIN_UI_EMAIL;
const ADMIN_UI_PASSWORD = process.env.ADMIN_UI_PASSWORD;

test("Admin login page is reachable", async ({ page }) => {
  await page.goto(`${ADMIN_APP_URL}/login`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("input#email")).toBeVisible();
  await expect(page.locator("input#password")).toBeVisible();
});

test("Admin can login and open dashboard/coupon/reviews pages", async ({ page }) => {
  test.skip(!ADMIN_UI_EMAIL || !ADMIN_UI_PASSWORD, "ADMIN_UI_EMAIL/ADMIN_UI_PASSWORD env eksik");

  await page.goto(`${ADMIN_APP_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.fill("input#email", ADMIN_UI_EMAIL);
  await page.fill("input#password", ADMIN_UI_PASSWORD);
  await page.getByRole("button", { name: /Sign In/i }).click();

  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible();

  await page.goto(`${ADMIN_APP_URL}/coupon`, { waitUntil: "domcontentloaded" });
  await expect(page.locator('input[placeholder*="coupon"]')).toBeVisible();

  await page.goto(`${ADMIN_APP_URL}/reviews`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Yorumlar|Reviews/i })).toBeVisible();
});

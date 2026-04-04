import { test, expect } from "@playwright/test";

const CUSTOMER_APP_URL = process.env.CUSTOMER_APP_URL ?? "http://localhost:3000";

test("Customer public auth forms are reachable", async ({ page }) => {
  await page.goto(`${CUSTOMER_APP_URL}/login`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("input#email")).toBeVisible();
  await expect(page.locator("input#password")).toBeVisible();

  await page.goto(`${CUSTOMER_APP_URL}/register`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("input#name")).toBeVisible();
  await expect(page.locator("input#email")).toBeVisible();
  await expect(page.locator("input#password")).toBeVisible();
  await expect(page.locator("input#confirmPassword")).toBeVisible();
});

test("Customer shop -> product -> cart -> checkout smoke flow", async ({ page }) => {
  await page.goto(`${CUSTOMER_APP_URL}/shop`, { waitUntil: "domcontentloaded" });

  const productLink = page.locator('a[href*="/product-details/"]').first();
  await expect(productLink).toBeVisible();
  await productLink.click();

  await expect(page).toHaveURL(/\/product-details\//);
  const addToCartButton = page.locator("button.product-add-cart-btn-3").first();
  await expect(addToCartButton).toBeVisible();
  await addToCartButton.click();

  await page.goto(`${CUSTOMER_APP_URL}/cart`, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".tp-cart-card").first()).toBeVisible();

  await page.goto(`${CUSTOMER_APP_URL}/checkout`, { waitUntil: "domcontentloaded" });
  await expect(page.locator('input[name="firstName"]')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
});

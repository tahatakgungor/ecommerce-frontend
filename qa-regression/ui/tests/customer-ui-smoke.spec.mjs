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

test("Customer mobile search dropdown allows navigating to product details", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${CUSTOMER_APP_URL}/shop`, { waitUntil: "domcontentloaded" });

  const firstProductTitle = (await page.locator(".product__title a").first().innerText()).trim();
  expect(firstProductTitle.length).toBeGreaterThan(2);

  await page.locator(".header__action-13 li.d-xxl-none a").first().click();
  const searchInput = page.locator(".container-fluid.d-xxl-none .header__search-input-13 input").first();
  await expect(searchInput).toBeVisible();

  const query = firstProductTitle.slice(0, 3);
  await searchInput.fill(query);

  const firstSuggestion = page.locator(".tp-search-dropdown__item").first();
  await expect(firstSuggestion).toBeVisible({ timeout: 10_000 });
  await firstSuggestion.click();

  await expect(page).toHaveURL(/\/product-details\//);
});

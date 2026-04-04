import { test, expect } from "@playwright/test";

const CUSTOMER_APP_URL = process.env.CUSTOMER_APP_URL ?? "http://localhost:3000";
const CUSTOMER_UI_EMAIL = process.env.CUSTOMER_UI_EMAIL;
const CUSTOMER_UI_PASSWORD = process.env.CUSTOMER_UI_PASSWORD;

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
  await expect(page).toHaveURL(/\/(checkout|login)/);

  const checkoutFirstNameInput = page.locator('input[name="firstName"]');
  const loginEmailInput = page.locator("input#email");

  let finalView = "pending";
  await expect
    .poll(
      async () => {
        if ((await checkoutFirstNameInput.count()) > 0) {
          const visible = await checkoutFirstNameInput.first().isVisible().catch(() => false);
          if (visible) {
            finalView = "checkout";
            return finalView;
          }
        }
        if ((await loginEmailInput.count()) > 0) {
          const visible = await loginEmailInput.first().isVisible().catch(() => false);
          if (visible) {
            finalView = "login";
            return finalView;
          }
        }
        finalView = "pending";
        return finalView;
      },
      { timeout: 15_000 }
    )
    .toMatch(/checkout|login/);

  if (finalView === "checkout") {
    await expect(checkoutFirstNameInput).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  } else {
    await expect(loginEmailInput).toBeVisible();
    await expect(page.locator("input#password")).toBeVisible();
  }
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

test("Guest checkout route redirects to login", async ({ page }) => {
  await page.goto(`${CUSTOMER_APP_URL}/checkout`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator("input#email")).toBeVisible();
});

test("Product details rating summary renders 5 icons with numeric score", async ({ page }) => {
  await page.goto(`${CUSTOMER_APP_URL}/shop`, { waitUntil: "domcontentloaded" });
  await page.locator('a[href*="/product-details/"]').first().click();

  await expect(page).toHaveURL(/\/product-details\//);
  await expect(page.locator(".tp-rating-summary__avg")).toHaveText(/\d+\.\d/);
  await expect(page.locator(".tp-rating-summary__stars .tp-rating-summary__star")).toHaveCount(5);
  await expect(page.locator(".tp-rating-summary__stars i")).toHaveCount(6);
});

test("Customer login honors redirect parameter to checkout", async ({ page }) => {
  test.skip(!CUSTOMER_UI_EMAIL || !CUSTOMER_UI_PASSWORD, "CUSTOMER_UI_EMAIL/CUSTOMER_UI_PASSWORD env eksik");

  await page.goto(`${CUSTOMER_APP_URL}/login?redirect=/checkout`, { waitUntil: "domcontentloaded" });
  await page.fill("input#email", CUSTOMER_UI_EMAIL);
  await page.fill("input#password", CUSTOMER_UI_PASSWORD);
  await page.getByRole("button", { name: /Sign In|Giriş/i }).click();
  await expect(page).toHaveURL(/\/checkout/, { timeout: 20_000 });
});

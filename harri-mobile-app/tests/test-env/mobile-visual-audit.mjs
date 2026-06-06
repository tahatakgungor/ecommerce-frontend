import fs from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright-core";

import {
  MOBILE_ROOT,
  ORDER_LOOKUP_FIXTURE_PATH,
  PRODUCTS_FIXTURE_PATH,
  TEST_ENV_MOBILE_ORIGIN,
  TEST_MOBILE_USER,
  readJson,
  resolveChromeExecutable,
} from "./shared.mjs";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || TEST_ENV_MOBILE_ORIGIN;
const outputDir = path.join(MOBILE_ROOT, "artifacts", "visual-audit");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function waitForLocation(page, predicate, message) {
  const timeoutAt = Date.now() + 30_000;

  while (Date.now() < timeoutAt) {
    if (predicate(page.url())) {
      return;
    }
    await page.waitForTimeout(250);
  }

  throw new Error(message || `Unexpected URL: ${page.url()}`);
}

async function capture(page, name) {
  const filePath = path.join(outputDir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

async function run() {
  const executablePath = resolveChromeExecutable();
  assert(executablePath, "Chrome executable not found. Set PLAYWRIGHT_CHROME_PATH.");

  const lookupFixture = await readJson(ORDER_LOOKUP_FIXTURE_PATH);
  const productsFixture = await readJson(PRODUCTS_FIXTURE_PATH);
  const lookupOrder = lookupFixture?.data?.order;
  const firstProduct = Array.isArray(productsFixture?.products) ? productsFixture.products[0] : null;

  assert(lookupOrder?._id, "Order lookup fixture missing order id");
  assert(firstProduct?._id, "Products fixture missing first product");

  await ensureDir(outputDir);

  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 430, height: 932 }, isMobile: true });
  const shots = [];

  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("home-search-input").waitFor({ timeout: 30_000 });
  shots.push(await capture(page, "01-home"));

  await page.goto(`${baseUrl}/catalog`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("catalog-search-input").waitFor({ timeout: 30_000 });
  shots.push(await capture(page, "02-catalog"));

  await page.goto(`${baseUrl}/product/${firstProduct._id}`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("product-add-to-cart").waitFor({ timeout: 30_000 });
  shots.push(await capture(page, "03-product"));

  await page.getByTestId("product-add-to-cart").click();
  await page.goto(`${baseUrl}/cart`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("cart-go-to-checkout").waitFor({ timeout: 30_000 });
  shots.push(await capture(page, "04-cart"));

  await page.getByTestId("cart-go-to-checkout").click();
  await waitForLocation(page, (currentUrl) => currentUrl.endsWith("/checkout"), "Checkout route did not open.");
  await page.getByText("Güvenli checkout").waitFor({ timeout: 30_000 });
  shots.push(await capture(page, "05-checkout"));

  await page.goto(`${baseUrl}/account`, { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder("ornek@serravit.com").fill(TEST_MOBILE_USER.email);
  await page.getByPlaceholder("Şifreniz").fill(TEST_MOBILE_USER.loginCode);
  await page.getByTestId("account-sign-in").click();
  await page.getByTestId("account-open-profile").waitFor({ timeout: 30_000 });
  shots.push(await capture(page, "06-account"));

  await page.goto(`${baseUrl}/orders/${lookupOrder._id}`, { waitUntil: "domcontentloaded" });
  await page.getByText("Fatura özeti").waitFor({ timeout: 30_000 });
  shots.push(await capture(page, "07-order-detail"));

  await page.goto(`${baseUrl}/wishlist`, { waitUntil: "domcontentloaded" });
  shots.push(await capture(page, "08-wishlist"));

  await browser.close();
  console.log(JSON.stringify({ baseUrl, outputDir, shots }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

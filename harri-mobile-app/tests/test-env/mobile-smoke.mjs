import { chromium } from "playwright-core";

import {
  ORDER_LOOKUP_FIXTURE_PATH,
  PRODUCTS_FIXTURE_PATH,
  TEST_ENV_MOBILE_ORIGIN,
  TEST_MOBILE_USER,
  readJson,
  resolveChromeExecutable,
} from "./shared.mjs";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || TEST_ENV_MOBILE_ORIGIN;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function waitForLocation(page, predicate, message) {
  const timeoutAt = Date.now() + 30_000;

  while (Date.now() < timeoutAt) {
    const currentUrl = page.url();
    if (predicate(currentUrl)) {
      return;
    }

    await page.waitForTimeout(250);
  }

  throw new Error(message || `Unexpected URL: ${page.url()}`);
}

async function run() {
  const executablePath = resolveChromeExecutable();
  assert(executablePath, "Chrome executable not found. Set PLAYWRIGHT_CHROME_PATH.");

  const lookupFixture = await readJson(ORDER_LOOKUP_FIXTURE_PATH);
  const productsFixture = await readJson(PRODUCTS_FIXTURE_PATH);
  const lookupOrder = lookupFixture?.data?.order;
  const lookupInvoice = String(lookupFixture?.data?.invoice || "");
  const lookupEmail = String(lookupFixture?.data?.email || "");
  const firstProduct = Array.isArray(productsFixture?.products) ? productsFixture.products[0] : null;
  const firstProductId = String(firstProduct?._id || "");
  const firstProductTitle = String(firstProduct?.title || "");

  assert(lookupOrder?._id, "Order lookup fixture missing order id");
  assert(lookupInvoice && lookupEmail, "Order lookup fixture missing invoice/email");
  assert(firstProductId && firstProductTitle, "Products fixture missing first product");

  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });

  const page = await browser.newPage({ viewport: { width: 430, height: 932 }, isMobile: true });

  await page.goto(`${baseUrl}/account`, { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/account$/i, { timeout: 30_000 });
  await page.getByText("Misafir Siparis Sorgula").waitFor({ timeout: 30_000 });

  await page.getByPlaceholder("SRV-1001").fill(lookupInvoice);
  await page.getByPlaceholder("ornek@mail.com").fill(lookupEmail);
  await page.getByTestId("account-guest-order-lookup").click();
  await waitForLocation(
    page,
    (currentUrl) => currentUrl.includes(`/orders/${lookupOrder._id}`) && currentUrl.includes(`invoice=${encodeURIComponent(lookupInvoice)}`),
    "Guest order detail route did not open."
  );
  await page.getByText(`Siparis ${lookupInvoice}`).waitFor({ timeout: 30_000 });
  await page.getByText("Genel toplam").waitFor({ timeout: 30_000 });

  await page.goto(`${baseUrl}/account`, { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder("ornek@serravit.com").fill(TEST_MOBILE_USER.email);
  await page.getByPlaceholder("Sifreniz").fill(TEST_MOBILE_USER.password);
  await page.getByTestId("account-sign-in").click();
  await page.getByText("Tum Siparisler").waitFor({ timeout: 30_000 });
  await page.getByTestId(`order-card-${lookupOrder._id}`).click();
  await waitForLocation(
    page,
    (currentUrl) => currentUrl.endsWith(`/orders/${lookupOrder._id}`),
    "Authenticated order detail route did not open."
  );
  await page.getByText(`Siparis ${lookupInvoice}`).waitFor({ timeout: 30_000 });

  await page.goto(`${baseUrl}/catalog`, { waitUntil: "domcontentloaded" });
  await page.getByText("Mobil katalog").waitFor({ timeout: 30_000 });
  await page.getByTestId(`product-card-${firstProductId}`).click();
  await waitForLocation(
    page,
    (currentUrl) => currentUrl.endsWith(`/product/${firstProductId}`),
    "Product detail route did not open."
  );
  await page.getByTestId("product-add-to-cart").click();

  await page.goto(`${baseUrl}/cart`, { waitUntil: "domcontentloaded" });
  await page.getByText(firstProductTitle).waitFor({ timeout: 30_000 });
  await page.getByTestId("cart-go-to-checkout").click();
  await waitForLocation(
    page,
    (currentUrl) => currentUrl.endsWith("/checkout"),
    "Checkout route did not open."
  );
  await page.getByText("Guvenli checkout").waitFor({ timeout: 30_000 });
  await page.getByTestId("checkout-start-payment").waitFor({ timeout: 30_000 });

  const summary = {
    baseUrl,
    guestLookup: lookupOrder._id,
    authenticatedOrder: lookupInvoice,
    productId: firstProductId,
    checkoutReached: true,
  };

  await browser.close();
  console.log(JSON.stringify(summary, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

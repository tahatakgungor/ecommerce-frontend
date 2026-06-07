import { chromium } from "playwright-core";

import {
  ORDER_LOOKUP_FIXTURE_PATH,
  PRODUCTS_FIXTURE_PATH,
  TEST_ENV_MOBILE_ORIGIN,
  TEST_MOBILE_COUPON,
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

async function waitForAccountState(page) {
  const timeoutAt = Date.now() + 30_000;

  while (Date.now() < timeoutAt) {
    const hasOrders = (await page.getByTestId("account-open-profile").count().catch(() => 0)) > 0;
    if (hasOrders) {
      return "authenticated";
    }

    const hasLogin = (await page.getByPlaceholder("ornek@serravit.com").count().catch(() => 0)) > 0;
    if (hasLogin) {
      return "login";
    }

    await page.waitForTimeout(250);
  }

  throw new Error("Account screen did not reach login or authenticated state.");
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

  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("home-search-input").waitFor({ timeout: 30_000 });
  await page.getByTestId("home-search-input").click();
  await page.keyboard.type(firstProductTitle);
  await page.getByTestId("home-search-input").press("Enter");
  await page.getByTestId(`search-suggestion-${firstProductId}`).waitFor({ timeout: 30_000 });

  await page.goto(`${baseUrl}/account`, { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/account$/i, { timeout: 30_000 });
  await page.getByTestId("account-open-orders").waitFor({ timeout: 30_000 });

  await page.getByTestId("account-primary-register").click();
  await waitForLocation(page, (currentUrl) => currentUrl.endsWith("/register"), "Register route did not open.");
  await page.getByTestId("register-first-name").fill("Test");
  await page.getByTestId("register-last-name").fill("Musteri");
  await page.getByTestId("register-phone").fill("05550000000");
  await page.getByTestId("register-email").fill(TEST_MOBILE_USER.email);
  await page.getByTestId("register-password").fill("fixture-register-code");
  await page.getByTestId("register-confirm-password").fill("fixture-register-code");
  await page.getByTestId("register-submit").click();
  await page.getByText("E-posta gönderildi").waitFor({ timeout: 30_000 });

  await page.goto(`${baseUrl}/confirm-email?token=${encodeURIComponent(TEST_MOBILE_USER.confirmEmailToken)}`, { waitUntil: "domcontentloaded" });
  await page.getByText("E-posta onayı").waitFor({ timeout: 30_000 });
  await page.getByTestId("confirm-email-success").waitFor({ timeout: 30_000 });

  await page.goto(`${baseUrl}/forgot-password`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("forgot-password-email").fill(TEST_MOBILE_USER.email);
  await page.getByTestId("forgot-password-submit").click();
  await page.getByText("Bağlantı gönderildi").waitFor({ timeout: 30_000 });

  await page.goto(`${baseUrl}/reset-password/${encodeURIComponent(TEST_MOBILE_USER.resetPasswordToken)}#token=${encodeURIComponent(TEST_MOBILE_USER.resetPasswordToken)}`, {
    waitUntil: "domcontentloaded",
  });
  await page.getByPlaceholder("En az 6 karakter").fill("fixture-reset-code-2");
  await page.getByPlaceholder("Şifreyi tekrar girin").fill("fixture-reset-code-2");
  await page.getByTestId("reset-password-submit").click();
  await page.getByText("Şifre güncellendi").waitFor({ timeout: 30_000 });

  await page.goto(`${baseUrl}/account`, { waitUntil: "domcontentloaded" });
  const accountState = await waitForAccountState(page);
  if (accountState === "login") {
    await page.getByPlaceholder("ornek@serravit.com").fill(TEST_MOBILE_USER.email);
    await page.getByPlaceholder("Şifreniz").fill(TEST_MOBILE_USER.loginCode);
    await page.getByTestId("account-sign-in").click();
  }
  await page.getByTestId("account-open-profile").waitFor({ timeout: 30_000 });

  await page.goto(`${baseUrl}/blog`, { waitUntil: "domcontentloaded" });
  await page.locator('[data-testid^="blog-open-"]').first().waitFor({ timeout: 30_000 });
  await page.locator('[data-testid^="blog-open-"]').first().click();
  await waitForLocation(page, (currentUrl) => /\/blog\/[^/]+$/i.test(currentUrl), "Blog detail route did not open.");
  await page.getByTestId("blog-detail-title").waitFor({ timeout: 30_000 });

  await page.goto(`${baseUrl}/account`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("account-open-profile").waitFor({ timeout: 30_000 });

  await page.getByTestId("account-open-support").click();
  await waitForLocation(page, (currentUrl) => currentUrl.endsWith("/support"), "Support route did not open.");
  await page.getByTestId("support-card-contact").click();
  await waitForLocation(page, (currentUrl) => currentUrl.endsWith("/contact"), "Contact route did not open.");
  await page.getByTestId("contact-name").fill("Smoke Tester");
  await page.getByTestId("contact-email").fill(TEST_MOBILE_USER.email);
  await page.getByTestId("contact-phone").fill("05550000000");
  await page.getByTestId("contact-company").fill("Mobile Smoke");
  await page.getByTestId("contact-message").fill("Mobil uygulama destek akisi smoke test senaryosunda dogrulaniyor.");
  await page.getByTestId("contact-submit").click();
  await page.getByText("Mesaj iletildi").waitFor({ timeout: 30_000 });

  await page.goto(`${baseUrl}/account`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("account-open-profile").waitFor({ timeout: 30_000 });
  await page.getByTestId("account-open-profile").click();
  await waitForLocation(page, (currentUrl) => currentUrl.endsWith("/profile"), "Profile route did not open.");
  await page.getByTestId("profile-phone").fill("05559998877");
  await page.getByTestId("profile-add-address").click();
  await page.getByTestId("profile-address-label").fill("Ev");
  await page.getByTestId("profile-address-line").fill("Moda Caddesi 15");
  await page.getByTestId("profile-address-city").fill("Istanbul");
  await page.getByTestId("profile-address-country").fill("Kadikoy");
  await page.getByTestId("profile-address-zip").fill("34710");
  await page.getByTestId("profile-address-save").click();
  await page.getByTestId("profile-save").click();
  await page.getByText("Profil güncellendi").waitFor({ timeout: 30_000 });

  await page.goto(`${baseUrl}/account`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("account-open-profile").waitFor({ timeout: 30_000 });
  await page.getByTestId("account-open-change-password").click();
  await waitForLocation(page, (currentUrl) => currentUrl.endsWith("/change-password"), "Change password route did not open.");
  await page.getByTestId("change-password-current").fill("fixture-login-code-mobile-smoke");
  await page.getByTestId("change-password-next").fill("fixture-login-code-mobile-smoke-2");
  await page.getByTestId("change-password-confirm").fill("fixture-login-code-mobile-smoke-2");
  await page.getByTestId("change-password-submit").click();
  await page.getByText("Kod gönderildi").waitFor({ timeout: 30_000 });
  await page.getByTestId("change-password-code").fill(TEST_MOBILE_USER.passwordChangeCode);
  await page.getByTestId("change-password-submit").click();
  await page.getByText("Şifre güncellendi").waitFor({ timeout: 30_000 });

  await page.goto(`${baseUrl}/account`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("account-open-orders").click();
  await waitForLocation(page, (currentUrl) => currentUrl.endsWith("/orders"), "Orders hub route did not open.");
  await page.getByText("Sipariş listesi").waitFor({ timeout: 30_000 });
  await page.getByTestId(`order-card-${lookupOrder._id}`).click();
  await waitForLocation(
    page,
    (currentUrl) => currentUrl.endsWith(`/orders/${lookupOrder._id}`),
    "Authenticated order detail route did not open."
  );
  await page.getByText(`Sipariş ${lookupInvoice}`).waitFor({ timeout: 30_000 });
  await page.getByTestId("order-track-shipment").waitFor({ timeout: 30_000 });
  await page.getByTestId("order-open-reviews").click();
  await waitForLocation(
    page,
    (currentUrl) => currentUrl.includes(`/reviews`) && currentUrl.includes(`orderId=${encodeURIComponent(lookupOrder._id)}`),
    "Review hub route did not open."
  );
  await page.getByTestId("review-pick-media").waitFor({ timeout: 30_000 });
  await page.getByTestId("review-title").fill("Mobil yorum smoke");
  await page.getByTestId("review-body").fill("Siparis sonrasi yorum akisi smoke test senaryosunda dogrulandi.");
  await page.getByTestId("review-star-4").click();
  await page.getByTestId("review-save").click();
  await page.getByText("Değerlendirmeniz alındı").waitFor({ timeout: 30_000 });

  await page.goto(`${baseUrl}/orders/${lookupOrder._id}?viewToken=fixture-view-token`, { waitUntil: "domcontentloaded" });
  await page.getByText(`Sipariş ${lookupInvoice}`).waitFor({ timeout: 30_000 });
  await page.getByTestId("order-track-shipment").waitFor({ timeout: 30_000 });

  await page.goto(`${baseUrl}/orders/${lookupOrder._id}`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("order-open-returns").click();
  await waitForLocation(
    page,
    (currentUrl) => currentUrl.includes(`/returns`) && currentUrl.includes(`orderId=${encodeURIComponent(lookupOrder._id)}`),
    "Returns hub route did not open."
  );
  await page.getByTestId("return-note").fill("Paket kosesinde ezilme tespit edildi.");
  await page.getByTestId("return-submit").click();
  await page.getByText("İade talebiniz alındı").waitFor({ timeout: 30_000 });
  await page.getByTestId(`return-card-${lookupOrder._id}`).waitFor({ timeout: 30_000 });

  await page.goto(`${baseUrl}/catalog`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("catalog-search-input").waitFor({ timeout: 30_000 });
  await page.getByTestId("catalog-filter-parent-trigger").click();
  const parentOptions = page.locator('[data-testid^="catalog-parent-"]');
  await parentOptions.first().waitFor({ timeout: 30_000 });
  await parentOptions.first().click();
  const childTriggerCount = await page.getByTestId("catalog-filter-child-trigger").count().catch(() => 0);
  if (childTriggerCount > 0) {
    await page.getByTestId("catalog-filter-child-trigger").click();
    const childOptions = page.locator('[data-testid^="catalog-child-"]');
    if ((await childOptions.count()) > 0) {
      await childOptions.first().click();
    }
  }
  await page.getByTestId("catalog-filter-sort-trigger").click();
  await page.getByTestId("catalog-sort-price-desc").waitFor({ timeout: 30_000 });
  await page.getByTestId("catalog-sort-price-desc").click();
  await page.getByTestId("catalog-filter-reset").waitFor({ timeout: 30_000 });
  await page.getByTestId("catalog-filter-reset").click();
  await page.getByTestId("catalog-search-input").waitFor({ timeout: 30_000 });
  await page.getByTestId(`product-card-${firstProductId}`).click();
  await waitForLocation(
    page,
    (currentUrl) => currentUrl.endsWith(`/product/${firstProductId}`),
    "Product detail route did not open."
  );
  await page.goto(`${baseUrl}/catalog`, { waitUntil: "domcontentloaded" });
  await page.getByTestId(`wishlist-toggle-${firstProductId}`).click();
  await page.goto(`${baseUrl}/wishlist`, { waitUntil: "domcontentloaded" });
  await page.getByText(firstProductTitle).waitFor({ timeout: 30_000 });

  await page.goto(`${baseUrl}/product/${firstProductId}`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("product-add-to-cart").click();

  await page.goto(`${baseUrl}/cart`, { waitUntil: "domcontentloaded" });
  await page.getByText(firstProductTitle).waitFor({ timeout: 30_000 });
  await page.getByTestId("cart-go-to-checkout").click();
  await waitForLocation(
    page,
    (currentUrl) => currentUrl.endsWith("/checkout"),
    "Checkout route did not open."
  );
  await page.getByText("Güvenli ödeme").waitFor({ timeout: 30_000 });
  await page.getByTestId("checkout-coupon-toggle").click();
  await page.getByTestId(`checkout-quick-coupon-${TEST_MOBILE_COUPON.couponCode.toLowerCase()}`).click();
  await page.getByTestId("checkout-applied-coupon").waitFor({ timeout: 30_000 });
  await page.getByTestId("checkout-coupon-message").waitFor({ timeout: 30_000 });
  await page.getByTestId("checkout-start-payment").waitFor({ timeout: 30_000 });

  const summary = {
    baseUrl,
    guestLookup: lookupOrder._id,
    authenticatedOrder: lookupInvoice,
    productId: firstProductId,
    couponCode: TEST_MOBILE_COUPON.couponCode,
    checkoutReached: true,
  };

  await browser.close();
  console.log(JSON.stringify(summary, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

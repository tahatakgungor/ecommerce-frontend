import { chromium } from "playwright-core";
import { resolveChromeExecutable } from "./shared.mjs";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3001";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  const executablePath = resolveChromeExecutable();
  assert(executablePath, "Chrome executable not found. Set PLAYWRIGHT_CHROME_PATH.");

  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });

  const dashboardPage = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await dashboardPage.goto(`${baseUrl}/dashboard`, { waitUntil: "domcontentloaded" });
  await dashboardPage.waitForSelector(".widget-item", { timeout: 30_000 });
  const dashboardCards = await dashboardPage.locator(".widget-item").count();
  assert(dashboardCards === 4, `Expected 4 dashboard summary cards, received ${dashboardCards}`);
  const recentOrderRows = await dashboardPage.locator(".admin-table-shell table tbody tr").count();
  assert(recentOrderRows > 0, "Dashboard recent orders table did not render rows");

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await desktop.goto(`${baseUrl}/product-list`, { waitUntil: "domcontentloaded" });
  await desktop.waitForSelector("table tbody tr", { timeout: 30_000 });
  const initialRows = await desktop.locator("table tbody tr").count();
  assert(initialRows > 0, "Product list table did not render rows");

  const productSearch = desktop.locator('input[placeholder="Ürün adı ile ara"]');
  await productSearch.fill("humat");
  await desktop.waitForTimeout(400);
  const filteredRows = await desktop.locator("table tbody tr").count();
  assert(filteredRows > 0 && filteredRows <= initialRows, "Product search did not narrow the table state");

  await desktop.locator('select').selectOption("inactive");
  await desktop.waitForTimeout(400);
  const inactiveStateText = ((await desktop.locator(".bg-white").first().textContent()) || "").trim();
  assert(inactiveStateText.length > 0, "Inactive product state did not update the page");

  const reviewPage = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await reviewPage.goto(`${baseUrl}/reviews`, { waitUntil: "domcontentloaded" });
  await reviewPage.waitForSelector(".admin-table-shell table tbody tr", { timeout: 30_000 });
  const reviewRows = await reviewPage.locator(".admin-table-shell table tbody tr").count();
  assert(reviewRows > 0, "Review moderation table did not render rows");

  await reviewPage.getByRole("button", { name: "APPROVED" }).click();
  await reviewPage.waitForTimeout(400);
  const approvedBadgeCount = await reviewPage.locator("text=APPROVED").count();
  assert(approvedBadgeCount > 0, "Approved review state did not render");

  const ordersPage = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await ordersPage.goto(`${baseUrl}/orders`, { waitUntil: "domcontentloaded" });
  await ordersPage.waitForSelector(".admin-table-shell table tbody tr", { timeout: 30_000 });
  const orderRows = await ordersPage.locator(".admin-table-shell table tbody tr").count();
  assert(orderRows > 0, "Orders table did not render rows");
  const firstInvoiceCell = ((await ordersPage.locator(".admin-table-shell table tbody tr td").first().textContent()) || "").trim();
  const invoiceSearch = firstInvoiceCell.replace(/^#/, "") || "5001";
  await ordersPage.locator('input[placeholder="Fatura no ile ara"]').fill(invoiceSearch);
  await ordersPage.waitForTimeout(400);
  const searchedOrderRows = await ordersPage.locator(".admin-table-shell table tbody tr").count();
  assert(searchedOrderRows > 0 && searchedOrderRows <= orderRows, "Order search did not update the table");
  await ordersPage.locator('select[aria-label="Duruma göre filtrele"]').selectOption("delivered");
  await ordersPage.waitForTimeout(400);
  const deliveredRows = await ordersPage.locator(".admin-table-shell table tbody tr").count();
  assert(deliveredRows > 0 && deliveredRows <= searchedOrderRows, "Delivered order filter did not update the table");

  const couponPage = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await couponPage.goto(`${baseUrl}/coupon`, { waitUntil: "domcontentloaded" });
  await couponPage.waitForSelector(".admin-table-shell table tbody tr", { timeout: 30_000 });
  const couponRows = await couponPage.locator(".admin-table-shell table tbody tr").count();
  assert(couponRows > 0, "Coupon table did not render rows");
  await couponPage.locator('input[placeholder="Kupon adına göre ara"]').fill("Sadakat");
  await couponPage.waitForTimeout(400);
  const filteredCouponRows = await couponPage.locator(".admin-table-shell table tbody tr").count();
  assert(filteredCouponRows > 0 && filteredCouponRows <= couponRows, "Coupon search did not update the table");
  await couponPage.getByRole("button", { name: /Kupon ekle/i }).click();
  await couponPage.waitForSelector(".offcanvas-opened", { timeout: 30_000 });
  const couponDrawerVisible = await couponPage.locator(".offcanvas-opened").count();
  assert(couponDrawerVisible > 0, "Coupon side panel did not open");

  const returnsPage = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await returnsPage.goto(`${baseUrl}/returns`, { waitUntil: "domcontentloaded" });
  await returnsPage.waitForSelector('text=/Talep Edildi|Onaylandı|Reddedildi/i', { timeout: 30_000 });
  const returnCards = await returnsPage.locator('text=/zeynep@test.local|mert@test.local/i').count();
  assert(returnCards > 0, "Returns cards did not render");
  await returnsPage.locator('input[placeholder="Müşteri, neden veya fatura ara"]').fill("5001");
  await returnsPage.waitForTimeout(400);
  const filteredReturnCards = await returnsPage.locator('text=/zeynep@test.local|mert@test.local/i').count();
  assert(filteredReturnCards > 0 && filteredReturnCards <= returnCards, "Returns search did not update the list");

  const contactPage = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await contactPage.goto(`${baseUrl}/contact-messages`, { waitUntil: "domcontentloaded" });
  await contactPage.waitForSelector("article.rounded-lg.border", { timeout: 30_000 });
  const contactCards = await contactPage.locator("article.rounded-lg.border").count();
  assert(contactCards > 0, "Contact messages did not render cards");
  await contactPage.locator('input[placeholder="Ad, e-posta veya mesaj ara"]').fill("Esra");
  await contactPage.waitForTimeout(400);
  const filteredContactCards = await contactPage.locator("article.rounded-lg.border").count();
  assert(filteredContactCards > 0 && filteredContactCards <= contactCards, "Contact search did not update the list");

  const customersPage = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await customersPage.goto(`${baseUrl}/our-staff`, { waitUntil: "domcontentloaded" });
  await customersPage.waitForSelector("table tbody tr", { timeout: 30_000 });
  const customerRows = await customersPage.locator("table tbody tr").count();
  assert(customerRows > 0, "Customer list did not render rows");
  await customersPage.locator('input[placeholder="Müşteri ara"]').fill("zeynep");
  await customersPage.waitForTimeout(400);
  const filteredCustomerRows = await customersPage.locator("table tbody tr").count();
  assert(filteredCustomerRows > 0 && filteredCustomerRows <= customerRows, "Customer search did not update the table");

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobile.goto(`${baseUrl}/product-list`, { waitUntil: "domcontentloaded" });
  await mobile.waitForSelector("article.rounded-xl", { timeout: 30_000 });
  const mobileProductCards = await mobile.locator("article.rounded-xl").count();
  assert(mobileProductCards > 0, "Mobile product cards did not render");

  const reviewMobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await reviewMobile.goto(`${baseUrl}/reviews`, { waitUntil: "domcontentloaded" });
  await reviewMobile.waitForSelector("article.rounded-md.border", { timeout: 30_000 });
  const mobileReviewCards = await reviewMobile.locator("article.rounded-md.border").count();
  assert(mobileReviewCards > 0, "Mobile review cards did not render");

  const returnsMobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await returnsMobile.goto(`${baseUrl}/returns`, { waitUntil: "domcontentloaded" });
  await returnsMobile.waitForSelector('text=/Talep Edildi|Onaylandı/i', { timeout: 30_000 });
  const mobileReturnsButtons = await returnsMobile.locator('button:has-text("Tümü")').count();
  assert(mobileReturnsButtons > 0, "Mobile returns filters did not render");

  console.log(
    JSON.stringify(
      {
        baseUrl,
        desktop: {
          dashboardCards,
          recentOrderRows,
          initialRows,
          filteredRows,
          inactiveStateText,
          reviewRows,
          orderRows,
          invoiceSearch,
          searchedOrderRows,
          deliveredRows,
          couponRows,
          filteredCouponRows,
          couponDrawerVisible,
          returnCards,
          filteredReturnCards,
          contactCards,
          filteredContactCards,
          customerRows,
          filteredCustomerRows,
        },
        mobile: {
          mobileProductCards,
          mobileReviewCards,
          mobileReturnsButtons,
        },
      },
      null,
      2
    )
  );

  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

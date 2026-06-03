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

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await desktop.goto(`${baseUrl}/product-list`, { waitUntil: "domcontentloaded" });
  await desktop.waitForSelector("table tbody tr", { timeout: 30_000 });

  const initialRows = await desktop.locator("table tbody tr").count();
  assert(initialRows > 0, "Product list table did not render rows");

  const productSearch = desktop.locator('input[placeholder="Ürün adı ile ara"]');
  await productSearch.fill("humat");
  await desktop.waitForTimeout(400);

  const filteredSummary = ((await desktop.locator("text=/ürün gösteriliyor/i").first().textContent()) || "").trim();
  assert(filteredSummary.length > 0, "Product list summary text missing after search");

  const reviewPage = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await reviewPage.goto(`${baseUrl}/reviews`, { waitUntil: "domcontentloaded" });
  await reviewPage.waitForSelector(".admin-table-shell table tbody tr", { timeout: 30_000 });

  const reviewRows = await reviewPage.locator(".admin-table-shell table tbody tr").count();
  assert(reviewRows > 0, "Review moderation table did not render rows");

  await reviewPage.getByRole("button", { name: "APPROVED" }).click();
  await reviewPage.waitForTimeout(400);
  const approvedBadgeCount = await reviewPage.locator("text=APPROVED").count();
  assert(approvedBadgeCount > 0, "Approved review state did not render");

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

  console.log(
    JSON.stringify(
      {
        baseUrl,
        desktop: {
          initialRows,
          filteredSummary,
          reviewRows,
        },
        mobile: {
          mobileProductCards,
          mobileReviewCards,
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

import { chromium } from "playwright-core";
import { resolveChromeExecutable } from "./shared.mjs";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3002";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readBrandSelection(urlValue) {
  const brandParam = new URL(urlValue).searchParams.get("brand") || "";
  return brandParam.split(",").map((item) => item.trim()).filter(Boolean);
}

function readCategorySelection(urlValue) {
  const categoryParam = new URL(urlValue).searchParams.get("category") || "";
  return categoryParam.split(",").map((item) => item.trim()).filter(Boolean);
}

async function waitForBrandCount(page, count) {
  await page.waitForURL(
    (url) => readBrandSelection(url.toString()).length === count,
    { timeout: 30_000 }
  );
}

async function waitForCategoryCount(page, count) {
  await page.waitForURL(
    (url) => readCategorySelection(url.toString()).length === count,
    { timeout: 30_000 }
  );
}

async function openDesktopFilterPanel(page) {
  const existingDrawer = page.locator(".shop__mobile-filter-drawer");
  if (await existingDrawer.count()) {
    if (await existingDrawer.first().isVisible()) {
      return;
    }
  }
  await page.getByRole("button", { name: /Filtrele|Filter/ }).click();
  await page.waitForSelector(".shop__mobile-filter-drawer", { state: "visible", timeout: 30_000 });
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

async function run() {
  const executablePath = resolveChromeExecutable();
  assert(executablePath, "Chrome executable not found. Set PLAYWRIGHT_CHROME_PATH.");

  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });

  const marketing = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await marketing.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await marketing.waitForSelector(".hero-banner__area", { timeout: 30_000 });
  const heroTitle = ((await marketing.locator(".hero-banner__title").first().textContent()) || "").trim();
  assert(heroTitle.length > 0, "Homepage hero title did not render");

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  await desktop.goto(`${baseUrl}/shop`, { waitUntil: "domcontentloaded" });
  await desktop.waitForSelector(".shop__main", { timeout: 30_000 });
  await desktop.waitForSelector(".product__item", { timeout: 30_000 });

  await openDesktopFilterPanel(desktop);
  const brandInputs = desktop.locator('.shop__mobile-filter-drawer #model_widget_collapse .shop__widget-list-item input[type="checkbox"]');
  const brandLabels = desktop.locator(".shop__mobile-filter-drawer #model_widget_collapse .shop__widget-list-item label");
  const brandCount = await brandInputs.count();
  assert(brandCount >= 2, `Expected at least 2 brands, received ${brandCount}`);

  const initialCards = await desktop.locator(".product__item").count();
  const firstBrandLabel = (await brandLabels.nth(0).textContent())?.trim() || "";
  const secondBrandLabel = (await brandLabels.nth(1).textContent())?.trim() || "";

  await brandInputs.nth(0).evaluate((element) => element.click());
  await waitForBrandCount(desktop, 1);
  await openDesktopFilterPanel(desktop);
  await desktop
    .locator('.shop__mobile-filter-drawer #model_widget_collapse .shop__widget-list-item input[type="checkbox"]')
    .nth(1)
    .evaluate((element) => element.click());
  await waitForBrandCount(desktop, 2);

  const activeBrands = readBrandSelection(desktop.url());
  assert(activeBrands.length === 2, `Expected 2 brand params, received ${activeBrands.length}`);

  const cardsAfterBrands = await desktop.locator(".product__item").count();
  const activeChipTextsAfterBrands = await desktop.locator(".shop__active-filter-chip span").allTextContents();
  assert(activeChipTextsAfterBrands.length >= 2, "Active filter chips did not render for brand filters");

  const firstProductHref = await desktop.locator('a[href^="/product-details/"]').first().getAttribute("href");
  const firstProductId = firstProductHref?.split("/").pop()?.split("?")[0];
  assert(firstProductId, "Could not resolve a product details URL from the shop grid");

  await openDesktopFilterPanel(desktop);
  const priceMinInput = desktop.locator(".shop__mobile-filter-drawer #shop-price-min");
  const priceMaxInput = desktop.locator(".shop__mobile-filter-drawer #shop-price-max");
  const catalogMin = Number(await priceMinInput.getAttribute("min"));
  const catalogMax = Number(await priceMaxInput.getAttribute("max"));
  const midpoint = Math.round((catalogMin + catalogMax) / 2);

  await priceMaxInput.fill(String(midpoint));
  await desktop.getByRole("button", { name: /Uygula|Apply/ }).click();
  await desktop.waitForURL(
    (url) => {
      const nextUrl = new URL(url.toString());
      return nextUrl.searchParams.has("max") || nextUrl.searchParams.has("priceMin");
    },
    { timeout: 30_000 }
  );

  const desktopPriceUrl = new URL(desktop.url());
  assert(
    desktopPriceUrl.searchParams.has("max") || desktopPriceUrl.searchParams.has("priceMin"),
    "Custom price range did not update the URL"
  );

  const cardsAfterPrice = await desktop.locator(".product__item").count();
  const activeChipTextsAfterPrice = await desktop.locator(".shop__active-filter-chip span").allTextContents();
  assert(activeChipTextsAfterPrice.length >= 3, "Price filter chip did not appear");

  const searchPage = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await searchPage.goto(`${baseUrl}/search?query=humat`, { waitUntil: "domcontentloaded" });
  await searchPage.waitForSelector(".shop__main .product__item", { timeout: 30_000 });
  const searchResults = await searchPage.locator(".shop__main .product__item").count();
  assert(searchResults > 0, "Search page did not render product results");

  const detailsPage = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await detailsPage.goto(`${baseUrl}/product-details/${firstProductId}`, { waitUntil: "domcontentloaded" });
  await detailsPage.waitForSelector(".product__details-area", { timeout: 30_000 });
  const detailsTitle = ((await detailsPage.locator(".product__details-title").textContent()) || "").trim();
  assert(detailsTitle.length > 0, "Product details title did not render");

  const orderLookupPage = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await orderLookupPage.goto(`${baseUrl}/order-lookup`, { waitUntil: "domcontentloaded" });
  await orderLookupPage.waitForSelector("form", { timeout: 30_000 });
  await orderLookupPage.locator('input[name="invoice"]').fill("SRV-1001");
  await orderLookupPage.locator('input[name="email"]').fill("guest@test.local");
  await orderLookupPage.getByRole("button", { name: /Siparişi Sorgula|Lookup Order/ }).click();
  await orderLookupPage.waitForURL(/\/order\/fixture-order-1\?/i, { timeout: 30_000 });
  await orderLookupPage.waitForSelector(".invoice__wrapper", { timeout: 30_000 });
  const invoiceHeading = ((await orderLookupPage.locator(".invoice__msg-wrapper strong").textContent()) || "").trim();
  assert(invoiceHeading.length > 0, "Order lookup flow did not render the order confirmation area");

  const viewTokenPage = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await viewTokenPage.goto(`${baseUrl}/order/fixture-order-1?viewToken=fixture-view-token`, { waitUntil: "domcontentloaded" });
  await viewTokenPage.waitForSelector(".invoice__wrapper", { timeout: 30_000 });
  const trackingLinkCount = await viewTokenPage.locator('a[href*="kargo"], a[href*="tracking"], a[href*="araskargo"]').count();
  assert(trackingLinkCount > 0, "Direct order view token flow did not render tracking action");

  await desktop.goto(`${baseUrl}/shop?Category=yasam-ve-saglik&category=gida-takviyesi`, {
    waitUntil: "domcontentloaded",
  });
  await desktop.waitForSelector(".shop__main", { timeout: 30_000 });
  await openDesktopFilterPanel(desktop);
  const categoryBrandLabels = await desktop
    .locator(".shop__mobile-filter-drawer #model_widget_collapse .shop__widget-list-item label")
    .allTextContents();
  const normalizedCategoryBrandLabels = categoryBrandLabels.map(normalizeText);
  assert(
    normalizedCategoryBrandLabels.length === 2,
    `Expected exactly 2 category brand labels, received ${categoryBrandLabels.join(", ")}`
  );
  assert(
    normalizedCategoryBrandLabels.some((label) => label.includes("humat") && label.includes("(1)")),
    `Expected HUMAT(1) in category brand labels, received ${categoryBrandLabels.join(", ")}`
  );
  assert(
    normalizedCategoryBrandLabels.some((label) => label.includes("serravit") && /\(\d+\)/.test(label)),
    `Expected a SERRAVIT label with a non-zero count, received ${categoryBrandLabels.join(", ")}`
  );
  assert(
    normalizedCategoryBrandLabels.every((label) => !label.includes("olvit")),
    `OLVIT should not appear in Gıda Takviyesi facet labels, received ${categoryBrandLabels.join(", ")}`
  );

  await desktop.locator(".shop__mobile-filter-drawer #model_widget_collapse .shop__widget-list-item input").nth(1).evaluate((element) => element.click());
  await waitForBrandCount(desktop, 1);
  const categoryBrandCards = await desktop.locator(".product__item").count();
  assert(categoryBrandCards > 0, "Selecting a category-scoped brand should not return an empty product list");

  const cosmeticOption = desktop
    .locator(".shop__mobile-filter-drawer .shop__category-group")
    .filter({ hasText: "Yaşam ve Sağlık" })
    .locator('.shop__category-option input[type="checkbox"]')
    .nth(1);
  await cosmeticOption.waitFor({ state: "visible", timeout: 30_000 });
  await cosmeticOption.evaluate((element) => element.click());
  await waitForCategoryCount(desktop, 2);
  const categoryDrawerStillVisible = await desktop.locator(".shop__mobile-filter-drawer").isVisible();
  assert(categoryDrawerStillVisible, "Filter drawer should stay open after category selection");
  const selectedCategories = readCategorySelection(desktop.url());
  assert(
    selectedCategories.length === 2,
    `Expected 2 category params after multi-select, received ${selectedCategories.join(", ")}`
  );

  await openDesktopFilterPanel(desktop);
  const presetPriceLabels = await desktop
    .locator(".shop__mobile-filter-drawer #price_widget_collapse .shop__widget-list-item label")
    .allTextContents();
  assert(
    presetPriceLabels.every((label) => !/\d+[.,]\d/.test(label)),
    `Expected rounded price preset labels without decimal fragments, received ${presetPriceLabels.join(", ")}`
  );
  assert(
    presetPriceLabels.some((label) => label.includes("+")),
    `Expected an open-ended rounded price preset label, received ${presetPriceLabels.join(", ")}`
  );

  await desktop.locator(".shop__active-filters-clear").evaluate((element) => element.click());
  await desktop.waitForURL((url) => new URL(url.toString()).pathname === "/shop" && !new URL(url.toString()).search, {
    timeout: 30_000,
  });
  assert(new URL(desktop.url()).pathname === "/shop", "Clear all did not reset shop URL");

  await desktop.goto(`${baseUrl}/shop?max=1`, { waitUntil: "domcontentloaded" });
  await desktop.waitForSelector(".shop__empty-state", { timeout: 30_000 });
  const emptyTitle = (await desktop.locator(".shop__empty-state h4").textContent())?.trim() || "";
  const emptyHint = (await desktop.locator(".shop__empty-state p").textContent())?.trim() || "";
  assert(Boolean(emptyTitle), "Empty state title missing");
  assert(Boolean(emptyHint), "Empty state hint missing");
  await desktop.locator(".shop__empty-state").getByRole("button", { name: /Filtreleri Temizle|Clear Filters/ }).click();
  await desktop.waitForURL((url) => new URL(url.toString()).pathname === "/shop" && !new URL(url.toString()).search, {
    timeout: 30_000,
  });
  assert(new URL(desktop.url()).pathname === "/shop", "Empty-state reset button did not return to /shop");

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobile.goto(`${baseUrl}/shop`, { waitUntil: "domcontentloaded" });
  await mobile.getByRole("button", { name: /Filtrele|Filter/ }).click();
  await mobile.waitForSelector(".shop__mobile-filter-drawer", { state: "visible", timeout: 30_000 });

  const drawerVisible = await mobile.locator(".shop__mobile-filter-drawer").isVisible();
  const bodyOverflow = await mobile.evaluate(() => document.body.style.overflow);
  assert(drawerVisible, "Mobile filter drawer did not open");
  assert(bodyOverflow === "hidden", "Body scroll lock did not activate on mobile drawer");

  const mobileBrandInput = mobile.locator('.shop__mobile-filter-drawer #model_widget_collapse .shop__widget-list-item input[type="checkbox"]').nth(0);
  await mobileBrandInput.evaluate((element) => element.click());
  await waitForBrandCount(mobile, 1);

  const mobileDrawerVisible = await mobile.locator(".shop__mobile-filter-drawer").isVisible();
  const mobileBrandParams = readBrandSelection(mobile.url()).length;
  assert(mobileDrawerVisible, "Mobile filter drawer should stay open after applying a filter");
  assert(mobileBrandParams === 1, `Expected 1 brand param on mobile, received ${mobileBrandParams}`);

  const summary = {
    baseUrl,
    desktop: {
      initialCards,
      cardsAfterBrands,
      cardsAfterPrice,
      heroTitle,
      searchResults,
      detailsTitle,
      invoiceHeading,
      firstBrandLabel,
      secondBrandLabel,
      activeChipTextsAfterBrands,
      activeChipTextsAfterPrice,
      categoryBrandLabels,
      presetPriceLabels,
      catalogMin,
      catalogMax,
      midpoint,
      emptyTitle,
    },
    mobile: {
      drawerVisible,
      bodyOverflow,
      mobileBrandParams,
    },
  };

  console.log(JSON.stringify(summary, null, 2));
  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

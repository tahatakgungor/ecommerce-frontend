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

async function waitForBrandCount(page, count) {
  await page.waitForURL(
    (url) => readBrandSelection(url.toString()).length === count,
    { timeout: 30_000 }
  );
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

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  await desktop.goto(`${baseUrl}/shop`, { waitUntil: "domcontentloaded" });
  await desktop.waitForSelector(".shop__main", { timeout: 30_000 });
  await desktop.waitForSelector(".product__item", { timeout: 30_000 });

  const brandInputs = desktop.locator('#model_widget_collapse .shop__widget-list-item input[type="checkbox"]');
  const brandLabels = desktop.locator("#model_widget_collapse .shop__widget-list-item label");
  const brandCount = await brandInputs.count();
  assert(brandCount >= 2, `Expected at least 2 brands, received ${brandCount}`);

  const initialCards = await desktop.locator(".product__item").count();
  const firstBrandLabel = (await brandLabels.nth(0).textContent())?.trim() || "";
  const secondBrandLabel = (await brandLabels.nth(1).textContent())?.trim() || "";

  await brandInputs.nth(0).evaluate((element) => element.click());
  await waitForBrandCount(desktop, 1);
  await brandInputs.nth(1).evaluate((element) => element.click());
  await waitForBrandCount(desktop, 2);

  const activeBrands = readBrandSelection(desktop.url());
  assert(activeBrands.length === 2, `Expected 2 brand params, received ${activeBrands.length}`);

  const cardsAfterBrands = await desktop.locator(".product__item").count();
  const activeChipTextsAfterBrands = await desktop.locator(".shop__active-filter-chip span").allTextContents();
  assert(activeChipTextsAfterBrands.length >= 2, "Active filter chips did not render for brand filters");

  const priceMinInput = desktop.locator("#shop-price-min");
  const priceMaxInput = desktop.locator("#shop-price-max");
  const catalogMin = Number(await priceMinInput.getAttribute("min"));
  const catalogMax = Number(await priceMaxInput.getAttribute("max"));
  const midpoint = Math.round((catalogMin + catalogMax) / 2);

  await priceMaxInput.fill(String(midpoint));
  await desktop.getByRole("button", { name: /Aralığı Uygula|Apply Range/ }).click();
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

  await desktop.goto(`${baseUrl}/shop?Category=yasam-ve-saglik&category=gida-takviyesi`, {
    waitUntil: "domcontentloaded",
  });
  await desktop.waitForSelector(".shop__main", { timeout: 30_000 });
  const categoryBrandLabels = await desktop
    .locator("#model_widget_collapse .shop__widget-list-item label")
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

  await desktop.locator("#model_widget_collapse .shop__widget-list-item input").nth(1).evaluate((element) => element.click());
  await waitForBrandCount(desktop, 1);
  const categoryBrandCards = await desktop.locator(".product__item").count();
  assert(categoryBrandCards > 0, "Selecting a category-scoped brand should not return an empty product list");

  const presetPriceLabels = await desktop
    .locator("#price_widget_collapse .shop__widget-list-item label")
    .allTextContents();
  assert(
    presetPriceLabels.every((label) => !/\d+[.,]\d/.test(label)),
    `Expected rounded price preset labels without decimal fragments, received ${presetPriceLabels.join(", ")}`
  );
  assert(
    presetPriceLabels.some((label) => label.includes("+")),
    `Expected an open-ended rounded price preset label, received ${presetPriceLabels.join(", ")}`
  );

  await desktop.getByRole("button", { name: /Tümünü temizle|Clear all/ }).click();
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
  await mobile.waitForSelector(".shop__mobile-filter-btn", { timeout: 30_000 });
  await mobile.getByRole("button", { name: /Filtrele|Filter/ }).click();
  await mobile.waitForSelector(".shop__mobile-filter-drawer", { state: "visible", timeout: 30_000 });

  const drawerVisible = await mobile.locator(".shop__mobile-filter-drawer").isVisible();
  const bodyOverflow = await mobile.evaluate(() => document.body.style.overflow);
  assert(drawerVisible, "Mobile filter drawer did not open");
  assert(bodyOverflow === "hidden", "Body scroll lock did not activate on mobile drawer");

  const mobileBrandInput = mobile.locator('.shop__mobile-filter-drawer #model_widget_collapse .shop__widget-list-item input[type="checkbox"]').nth(0);
  await mobileBrandInput.evaluate((element) => element.click());
  await waitForBrandCount(mobile, 1);

  const mobileDrawerCount = await mobile.locator(".shop__mobile-filter-drawer").count();
  const mobileBrandParams = readBrandSelection(mobile.url()).length;
  assert(mobileDrawerCount === 0, "Mobile filter drawer did not auto-close after applying a filter");
  assert(mobileBrandParams === 1, `Expected 1 brand param on mobile, received ${mobileBrandParams}`);

  const summary = {
    baseUrl,
    desktop: {
      initialCards,
      cardsAfterBrands,
      cardsAfterPrice,
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

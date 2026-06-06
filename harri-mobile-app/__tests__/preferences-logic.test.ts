import type { CatalogProduct } from "@/modules/catalog/types";
import { buildPersonalizedProductRail, recordRecentSearches, recordViewedProducts } from "@/modules/preferences/logic";
import { DEFAULT_COMMERCE_PREFERENCES_STATE } from "@/modules/preferences/types";

const baseProduct: CatalogProduct = {
  id: "product-1",
  title: "Kolajen Takviyesi",
  description: "Aciklama",
  brand: "Serravit",
  category: "Kolajen",
  parentCategory: "Takviye",
  childCategory: "Toz",
  imageUrl: null,
  gallery: [],
  price: 500,
  priceText: "₺500",
  originalPrice: 650,
  originalPriceText: "₺650",
  discount: 10,
  stockQuantity: 12,
  tags: ["kolajen"],
  colors: [],
  sku: "COL-1",
  status: "active",
};

describe("preferences logic", () => {
  it("deduplicates recent searches and keeps the latest query first", () => {
    const updated = recordRecentSearches(["magnezyum", "kolajen"], "Kolajen");
    expect(updated).toEqual(["Kolajen", "magnezyum"]);
  });

  it("deduplicates recently viewed products by id", () => {
    const updated = recordViewedProducts([{ ...baseProduct, viewedAt: "2026-06-06T00:00:00.000Z" }], baseProduct);
    expect(updated).toHaveLength(1);
    expect(updated[0]?.id).toBe(baseProduct.id);
  });

  it("prioritizes matching brand and category in personalized rails", () => {
    const matching = { ...baseProduct, id: "product-2", title: "Kolajen Tablet" };
    const offCategory = { ...baseProduct, id: "product-3", brand: "Baska Marka", category: "Vitamin", parentCategory: "Bagisiklik" };
    const preferences = {
      ...DEFAULT_COMMERCE_PREFERENCES_STATE,
      recentSearches: ["kolajen"],
      recentlyViewed: [{ ...baseProduct, viewedAt: "2026-06-06T00:00:00.000Z" }],
    };

    const rail = buildPersonalizedProductRail([offCategory, matching], preferences, 2);
    expect(rail[0]?.id).toBe("product-2");
  });
});

import type { CatalogProduct } from "@/modules/catalog/types";
import type { CommercePreferencesState, ViewedProductSnapshot } from "@/modules/preferences/types";

const DEFAULT_HISTORY_LIMIT = 8;
const DEFAULT_VIEW_LIMIT = 10;
const DEFAULT_RAIL_LIMIT = 6;

export function recordRecentSearches(current: string[], query: string, limit = DEFAULT_HISTORY_LIMIT) {
  const normalized = query.trim();
  if (!normalized) return current;

  const lowered = normalized.toLocaleLowerCase("tr-TR");
  const deduped = current.filter((item) => item.toLocaleLowerCase("tr-TR") !== lowered);
  return [normalized, ...deduped].slice(0, limit);
}

export function recordViewedProducts(
  current: ViewedProductSnapshot[],
  product: CatalogProduct,
  limit = DEFAULT_VIEW_LIMIT
) {
  const nextSnapshot: ViewedProductSnapshot = {
    ...product,
    viewedAt: new Date().toISOString(),
  };
  const deduped = current.filter((item) => item.id !== product.id);
  return [nextSnapshot, ...deduped].slice(0, limit);
}

export function buildPersonalizedProductRail(
  products: CatalogProduct[],
  preferences: CommercePreferencesState,
  limit = DEFAULT_RAIL_LIMIT
) {
  if (!products.length) return [];
  if (!preferences.personalization.personalizedHome) return products.slice(0, limit);

  const recentIds = new Set(preferences.recentlyViewed.map((item) => item.id));
  const preferredBrands = new Set(preferences.recentlyViewed.map((item) => item.brand).filter(Boolean));
  const preferredCategories = preferences.personalization.categoryRecommendations
    ? new Set(preferences.recentlyViewed.flatMap((item) => [item.parentCategory, item.category]).filter(Boolean))
    : new Set<string>();
  const searchTokens = preferences.recentSearches
    .flatMap((item) => item.toLocaleLowerCase("tr-TR").split(/\s+/))
    .filter((item) => item.length > 2)
    .slice(0, 12);

  const sorted = [...products]
    .map((product, index) => {
      let score = 0;

      if (recentIds.has(product.id)) score -= 4;
      if (preferredBrands.has(product.brand)) score += 5;
      if (preferredCategories.has(product.parentCategory)) score += 4;
      if (preferredCategories.has(product.category)) score += 3;
      if (product.discount > 0) score += 1;

      const haystack = `${product.title} ${product.brand} ${product.category} ${product.parentCategory} ${product.tags.join(" ")}`
        .toLocaleLowerCase("tr-TR");

      searchTokens.forEach((token) => {
        if (haystack.includes(token)) {
          score += 2;
        }
      });

      return { product, index, score };
    })
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.index - right.index;
    })
    .map((entry) => entry.product);

  return sorted.slice(0, limit);
}

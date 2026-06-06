import { fetchJson } from "@/lib/http-client";
import { toFilterSlug } from "@/modules/catalog/query";
import type { CategoryItem, RawCategoryEnvelope } from "@/modules/categories/types";

const CATEGORY_CACHE_TTL_MS = 5 * 60 * 1000;
const BUNDLED_CATALOG_FALLBACK = require("../../../../harri-front-end/tests/test-env/fixtures/public-api/products-show.json") as {
  products?: Array<{ parent?: string; category?: { name?: string }; children?: string }>;
};

let categoryCache: { value: CategoryItem[]; expiresAt: number } | null = null;
let categoryRequest: Promise<CategoryItem[]> | null = null;

function normalizeCategories(payload: RawCategoryEnvelope | RawCategoryEnvelope["categories"]) {
  const categoryList = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.categories)
      ? payload.categories
      : [];

  return categoryList
    .map((item, index) => {
      const label = String(item?.parent || item?.name || "").trim();
      if (!label) {
        return null;
      }

      return {
        id: String(item?._id || item?.id || `${toFilterSlug(label)}-${index}`),
        label,
        slug: toFilterSlug(label),
        imageUrl: item?.img || item?.image || null,
        children: Array.isArray(item?.children)
          ? item.children
              .map((child) => String(child || "").trim())
              .filter(Boolean)
              .map((child) => ({
                label: child,
                slug: toFilterSlug(child),
              }))
          : [],
      } satisfies CategoryItem;
    })
    .filter((item): item is CategoryItem => Boolean(item));
}

export function getFallbackCategories() {
  const grouped = new Map<string, Set<string>>();
  const products = Array.isArray(BUNDLED_CATALOG_FALLBACK?.products) ? BUNDLED_CATALOG_FALLBACK.products : [];

  products.forEach((product) => {
    const parentLabel = String(product?.parent || product?.category?.name || "").trim();
    if (!parentLabel) {
      return;
    }

    const currentChildren = grouped.get(parentLabel) || new Set<string>();
    const childLabel = String(product?.children || product?.category?.name || "").trim();
    if (childLabel && toFilterSlug(childLabel) !== toFilterSlug(parentLabel)) {
      currentChildren.add(childLabel);
    }
    grouped.set(parentLabel, currentChildren);
  });

  return Array.from(grouped.entries()).map(([label, children], index) => ({
    id: `fallback-category-${toFilterSlug(label)}-${index}`,
    label,
    slug: toFilterSlug(label),
    imageUrl: null,
    children: Array.from(children).map((child) => ({
      label: child,
      slug: toFilterSlug(child),
    })),
  }));
}

export async function fetchCategories(options?: { force?: boolean }) {
  const now = Date.now();
  if (!options?.force && categoryCache && categoryCache.expiresAt > now) {
    return categoryCache.value;
  }

  if (!options?.force && categoryRequest) {
    return categoryRequest;
  }

  categoryRequest = fetchJson<RawCategoryEnvelope>("/api/category/show", { timeoutMs: 5000 })
    .then((payload) => {
      const normalized = normalizeCategories(payload);
      const resolvedCategories = normalized.length ? normalized : getFallbackCategories();
      categoryCache = {
        value: resolvedCategories,
        expiresAt: Date.now() + CATEGORY_CACHE_TTL_MS,
      };
      return resolvedCategories;
    })
    .catch(() => getFallbackCategories())
    .finally(() => {
      categoryRequest = null;
    });

  return categoryRequest;
}

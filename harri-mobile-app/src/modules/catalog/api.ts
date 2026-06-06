import { fetchJson } from "@/lib/http-client";
import { readJsonValue, writeJsonValue } from "@/lib/json-store";
import { buildCatalogQueryParams, type CatalogQuery } from "@/modules/catalog/query";
import { normalizeCatalogGallery, normalizeCatalogMediaUrl } from "@/modules/catalog/media-url";
import {
  normalizeCatalogSnapshot,
  normalizeProduct,
} from "@harri/commerce-contracts";
import type { CatalogProduct, CatalogSnapshot, RawCatalogResponse, RawProductResponse } from "@/modules/catalog/types";
import {
  CATALOG_SORT,
  normalizeBrandFilters,
  normalizeCatalogSort,
  normalizeCategoryFilters,
  toFilterSlug,
} from "@/modules/catalog/query";

const CATALOG_CACHE_KEY = "catalog_snapshot_cache_v2";
const BUNDLED_CATALOG_FALLBACK = require("../../../../harri-front-end/tests/test-env/fixtures/public-api/products-show.json") as RawCatalogResponse;

function normalizeSnapshot(payload: RawCatalogResponse): CatalogSnapshot {
  const snapshot = normalizeCatalogSnapshot(payload);

  return {
    ...snapshot,
    products: snapshot.products.map((product: CatalogProduct) => ({
      ...product,
      imageUrl: normalizeCatalogMediaUrl(product.imageUrl),
      gallery: normalizeCatalogGallery(product.gallery),
    })),
  };
}

function applyCatalogQuery(snapshot: CatalogSnapshot, query: CatalogQuery = {}): CatalogSnapshot {
  const normalizedParent = toFilterSlug(query.parentCategory);
  const normalizedCategories = normalizeCategoryFilters(query.category);
  const normalizedBrands = normalizeBrandFilters(query.brand);
  const normalizedQuery = String(query.q || "").trim().toLocaleLowerCase("tr-TR");
  const normalizedSort = normalizeCatalogSort(query.sort);
  const page = Math.max(1, Number(query.page || 1));
  const size = Math.max(1, Number(query.size || 12));

  let products = [...snapshot.products];

  if (normalizedQuery) {
    products = products.filter((product) =>
      [product.title, product.brand, product.parentCategory, product.category, product.childCategory]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("tr-TR").includes(normalizedQuery))
    );
  }

  if (normalizedParent) {
    products = products.filter((product) => toFilterSlug(product.parentCategory || product.category) === normalizedParent);
  }

  if (normalizedCategories.length) {
    products = products.filter((product) => {
      const categorySlugs = [product.category, product.childCategory, product.parentCategory].map((value) => toFilterSlug(value)).filter(Boolean);
      return normalizedCategories.some((filterValue) => categorySlugs.includes(filterValue));
    });
  }

  if (normalizedBrands.length) {
    products = products.filter((product) => normalizedBrands.includes(toFilterSlug(product.brand)));
  }

  if (normalizedSort === CATALOG_SORT.priceAsc) {
    products.sort((left, right) => left.price - right.price);
  } else if (normalizedSort === CATALOG_SORT.priceDesc) {
    products.sort((left, right) => right.price - left.price);
  }

  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const sliceStart = (page - 1) * size;
  const pagedProducts = products.slice(sliceStart, sliceStart + size);

  const brandCounts = new Set(products.map((product) => product.brand).filter(Boolean));
  const categoryCounts = new Map<string, number>();
  products.forEach((product) => {
    const key = product.parentCategory || product.category || "Kategori";
    categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1);
  });

  return {
    ...snapshot,
    total,
    page,
    size,
    totalPages,
    products: pagedProducts,
    brands: Array.from(brandCounts),
    categories: Array.from(categoryCounts.entries()).map(([parent, count]) => ({ parent, count })),
  };
}

export async function fetchCatalogSnapshot(query: CatalogQuery = {}): Promise<CatalogSnapshot> {
  try {
    const payload = await fetchJson<RawCatalogResponse>(`/api/products/show?${buildCatalogQueryParams(query)}`, {
      timeoutMs: 25000,
    });
    const snapshot = normalizeSnapshot(payload);
    await writeJsonValue(CATALOG_CACHE_KEY, snapshot);
    return snapshot;
  } catch (error) {
    const cachedSnapshot = await readJsonValue<CatalogSnapshot | null>(CATALOG_CACHE_KEY, null);
    if (cachedSnapshot?.products?.length) {
      return applyCatalogQuery(cachedSnapshot, query);
    }

    const bundledSnapshot = normalizeSnapshot(BUNDLED_CATALOG_FALLBACK);
    if (bundledSnapshot.products.length) {
      return applyCatalogQuery(bundledSnapshot, query);
    }

    throw error;
  }
}

type ProductEnvelope = {
  data?: RawProductResponse;
  result?: RawProductResponse;
};

export async function fetchProductDetail(productId: string): Promise<CatalogProduct> {
  const payload = await fetchJson<RawProductResponse | ProductEnvelope>(`/api/products/${productId}`);
  const rawProduct =
    payload && typeof payload === "object" && ("data" in payload || "result" in payload)
      ? payload.data || payload.result
      : payload;

  const product = normalizeProduct((rawProduct || {}) as RawProductResponse);
  return {
    ...product,
    imageUrl: normalizeCatalogMediaUrl(product.imageUrl),
    gallery: normalizeCatalogGallery(product.gallery),
  };
}

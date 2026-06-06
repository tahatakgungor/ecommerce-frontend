import { fetchJson } from "@/lib/http-client";
import { readJsonValue, writeJsonValue } from "@/lib/json-store";
import { buildCatalogQueryParams, hasCatalogRefinements, serializeCatalogQuery, type CatalogQuery } from "@/modules/catalog/query";
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

const CATALOG_BASE_CACHE_KEY = "catalog_snapshot_cache_v3";
const CATALOG_QUERY_CACHE_KEY = "catalog_snapshot_query_cache_v1";
const PRODUCT_DETAIL_CACHE_KEY = "catalog_product_detail_cache_v1";
const CATALOG_MEMORY_CACHE_TTL_MS = 60 * 1000;
const PRODUCT_DETAIL_MEMORY_CACHE_TTL_MS = 2 * 60 * 1000;
const BUNDLED_CATALOG_FALLBACK = require("../../../../harri-front-end/tests/test-env/fixtures/public-api/products-show.json") as RawCatalogResponse;
const MAX_QUERY_CACHE_ENTRIES = 18;

const catalogSnapshotMemoryCache = new Map<string, { value: CatalogSnapshot; expiresAt: number }>();
const catalogSnapshotRequestCache = new Map<string, Promise<CatalogSnapshot>>();
const productDetailMemoryCache = new Map<string, { value: CatalogProduct; expiresAt: number }>();
const productDetailRequestCache = new Map<string, Promise<CatalogProduct>>();

type CatalogQueryCache = Record<
  string,
  {
    savedAt: number;
    snapshot: CatalogSnapshot;
  }
>;

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

export function applyCatalogQuery(snapshot: CatalogSnapshot, query: CatalogQuery = {}): CatalogSnapshot {
  const normalizedParent = toFilterSlug(query.parentCategory);
  const normalizedCategories = normalizeCategoryFilters(query.category);
  const normalizedBrands = normalizeBrandFilters(query.brand);
  const normalizedQuery = String(query.q || "").trim().toLocaleLowerCase("tr-TR");
  const normalizedSort = normalizeCatalogSort(query.sort);
  const page = Math.max(1, Number(query.page || 1));
  const size = Math.max(1, Number(query.size || 12));
  const matchedParentScope = Array.isArray(query.categoryItems)
    ? query.categoryItems.find((item) => toFilterSlug(item?.parent) === normalizedParent)
    : null;
  const parentScopeSlugs = new Set(
    Array.isArray(matchedParentScope?.children)
      ? matchedParentScope.children.map((item) => toFilterSlug(item)).filter(Boolean)
      : []
  );

  let products = [...snapshot.products];

  if (normalizedQuery) {
    products = products.filter((product) =>
      [product.title, product.brand, product.parentCategory, product.category, product.childCategory]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("tr-TR").includes(normalizedQuery))
    );
  }

  if (normalizedParent) {
    products = products.filter((product) => {
      const categorySlugs = [product.parentCategory, product.category, product.childCategory].map((value) => toFilterSlug(value)).filter(Boolean);
      return categorySlugs.includes(normalizedParent) || categorySlugs.some((slug) => parentScopeSlugs.has(slug));
    });
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

function buildProductMap(products: CatalogProduct[]) {
  return products.reduce<Record<string, CatalogProduct>>((accumulator, product) => {
    if (product.id) {
      accumulator[product.id] = product;
    }
    return accumulator;
  }, {});
}

async function readCatalogCache() {
  return readJsonValue<CatalogSnapshot | null>(CATALOG_BASE_CACHE_KEY, null);
}

async function readCatalogQueryCache() {
  return readJsonValue<CatalogQueryCache>(CATALOG_QUERY_CACHE_KEY, {});
}

async function writeCatalogQueryCache(query: CatalogQuery, snapshot: CatalogSnapshot) {
  const queryKey = serializeCatalogQuery(query);
  const currentCache = await readCatalogQueryCache();
  const nextCache: CatalogQueryCache = {
    ...currentCache,
    [queryKey]: {
      savedAt: Date.now(),
      snapshot,
    },
  };

  const trimmedCache = Object.fromEntries(
    Object.entries(nextCache)
      .sort((left, right) => right[1].savedAt - left[1].savedAt)
      .slice(0, MAX_QUERY_CACHE_ENTRIES)
  );

  await writeJsonValue(CATALOG_QUERY_CACHE_KEY, trimmedCache);
}

function isCompleteSnapshot(snapshot: CatalogSnapshot | null | undefined) {
  if (!snapshot) {
    return false;
  }

  return snapshot.total <= snapshot.products.length;
}

async function writeProductDetailCache(product: CatalogProduct) {
  if (!product.id) {
    return;
  }

  const currentCache = await readJsonValue<Record<string, CatalogProduct>>(PRODUCT_DETAIL_CACHE_KEY, {});
  await writeJsonValue(PRODUCT_DETAIL_CACHE_KEY, {
    ...currentCache,
    [product.id]: product,
  });
}

export async function getLocalCatalogSnapshot(query: CatalogQuery = {}) {
  const queryKey = serializeCatalogQuery(query);
  const memorySnapshot = catalogSnapshotMemoryCache.get(queryKey);
  if (memorySnapshot && memorySnapshot.expiresAt > Date.now()) {
    return memorySnapshot.value;
  }

  const queryCache = await readCatalogQueryCache();
  const exactSnapshot = queryCache[queryKey]?.snapshot;
  if (exactSnapshot?.products?.length) {
    catalogSnapshotMemoryCache.set(queryKey, {
      value: exactSnapshot,
      expiresAt: Date.now() + CATALOG_MEMORY_CACHE_TTL_MS,
    });
    return exactSnapshot;
  }

  const cachedSnapshot = await readCatalogCache();
  if (!hasCatalogRefinements(query) && cachedSnapshot?.products?.length) {
    catalogSnapshotMemoryCache.set(queryKey, {
      value: cachedSnapshot,
      expiresAt: Date.now() + CATALOG_MEMORY_CACHE_TTL_MS,
    });
    return cachedSnapshot;
  }

  if (cachedSnapshot?.products?.length) {
    const filteredSnapshot = applyCatalogQuery(cachedSnapshot, query);
    catalogSnapshotMemoryCache.set(queryKey, {
      value: filteredSnapshot,
      expiresAt: Date.now() + CATALOG_MEMORY_CACHE_TTL_MS,
    });
    return filteredSnapshot;
  }

  const bundledSnapshot = normalizeSnapshot(BUNDLED_CATALOG_FALLBACK);
  if (bundledSnapshot.products.length) {
    const filteredSnapshot = applyCatalogQuery(bundledSnapshot, query);
    catalogSnapshotMemoryCache.set(queryKey, {
      value: filteredSnapshot,
      expiresAt: Date.now() + CATALOG_MEMORY_CACHE_TTL_MS,
    });
    return filteredSnapshot;
  }

  return null;
}

export async function getLocalProductDetail(productId: string) {
  const memoryProduct = productDetailMemoryCache.get(productId);
  if (memoryProduct && memoryProduct.expiresAt > Date.now()) {
    return memoryProduct.value;
  }

  const productDetailCache = await readJsonValue<Record<string, CatalogProduct>>(PRODUCT_DETAIL_CACHE_KEY, {});
  if (productDetailCache[productId]) {
    productDetailMemoryCache.set(productId, {
      value: productDetailCache[productId],
      expiresAt: Date.now() + PRODUCT_DETAIL_MEMORY_CACHE_TTL_MS,
    });
    return productDetailCache[productId];
  }

  const cachedSnapshot = await readCatalogCache();
  const catalogProduct = cachedSnapshot?.products?.find((product) => product.id === productId);
  if (catalogProduct) {
    productDetailMemoryCache.set(productId, {
      value: catalogProduct,
      expiresAt: Date.now() + PRODUCT_DETAIL_MEMORY_CACHE_TTL_MS,
    });
    return catalogProduct;
  }

  const bundledSnapshot = normalizeSnapshot(BUNDLED_CATALOG_FALLBACK);
  const bundledProduct = bundledSnapshot.products.find((product) => product.id === productId) || null;
  if (bundledProduct) {
    productDetailMemoryCache.set(productId, {
      value: bundledProduct,
      expiresAt: Date.now() + PRODUCT_DETAIL_MEMORY_CACHE_TTL_MS,
    });
  }
  return bundledProduct;
}

export async function fetchCatalogSnapshot(query: CatalogQuery = {}, options?: { force?: boolean }): Promise<CatalogSnapshot> {
  const queryKey = serializeCatalogQuery(query);
  const memorySnapshot = catalogSnapshotMemoryCache.get(queryKey);
  if (!options?.force && memorySnapshot && memorySnapshot.expiresAt > Date.now()) {
    return memorySnapshot.value;
  }

  const inflightRequest = catalogSnapshotRequestCache.get(queryKey);
  if (!options?.force && inflightRequest) {
    return inflightRequest;
  }

  const request = (async () => {
    try {
      const payload = await fetchJson<RawCatalogResponse>(`/api/products/show?${buildCatalogQueryParams(query)}`, {
        timeoutMs: 6000,
      });
      const snapshot = normalizeSnapshot(payload);
      catalogSnapshotMemoryCache.set(queryKey, {
        value: snapshot,
        expiresAt: Date.now() + CATALOG_MEMORY_CACHE_TTL_MS,
      });
      await writeCatalogQueryCache(query, snapshot);
      if (!hasCatalogRefinements(query) && Number(query.page || 1) === 1) {
        await writeJsonValue(CATALOG_BASE_CACHE_KEY, snapshot);
      }
      const currentProductCache = await readJsonValue<Record<string, CatalogProduct>>(PRODUCT_DETAIL_CACHE_KEY, {});
      await writeJsonValue(PRODUCT_DETAIL_CACHE_KEY, {
        ...currentProductCache,
        ...buildProductMap(snapshot.products),
      });
      snapshot.products.forEach((product) => {
        if (product.id) {
          productDetailMemoryCache.set(product.id, {
            value: product,
            expiresAt: Date.now() + PRODUCT_DETAIL_MEMORY_CACHE_TTL_MS,
          });
        }
      });
      return snapshot;
    } catch (error) {
      const localSnapshot = await getLocalCatalogSnapshot(query);
      if (localSnapshot) {
        return localSnapshot;
      }

      throw error;
    } finally {
      catalogSnapshotRequestCache.delete(queryKey);
    }
  })();

  catalogSnapshotRequestCache.set(queryKey, request);
  return request;
}

type ProductEnvelope = {
  data?: RawProductResponse;
  result?: RawProductResponse;
};

export async function fetchProductDetail(productId: string): Promise<CatalogProduct> {
  const memoryProduct = productDetailMemoryCache.get(productId);
  if (memoryProduct && memoryProduct.expiresAt > Date.now()) {
    return memoryProduct.value;
  }

  const inflightRequest = productDetailRequestCache.get(productId);
  if (inflightRequest) {
    return inflightRequest;
  }

  const request = (async () => {
    try {
      const payload = await fetchJson<RawProductResponse | ProductEnvelope>(`/api/products/${productId}`, {
      timeoutMs: 7000,
      });
      const rawProduct =
        payload && typeof payload === "object" && ("data" in payload || "result" in payload)
          ? payload.data || payload.result
          : payload;

      const product = normalizeProduct((rawProduct || {}) as RawProductResponse);
      const normalizedProduct = {
        ...product,
        imageUrl: normalizeCatalogMediaUrl(product.imageUrl),
        gallery: normalizeCatalogGallery(product.gallery),
      };
      productDetailMemoryCache.set(productId, {
        value: normalizedProduct,
        expiresAt: Date.now() + PRODUCT_DETAIL_MEMORY_CACHE_TTL_MS,
      });
      await writeProductDetailCache(normalizedProduct);
      return normalizedProduct;
    } catch (error) {
      const localProduct = await getLocalProductDetail(productId);
      if (localProduct) {
        return localProduct;
      }

      throw error;
    } finally {
      productDetailRequestCache.delete(productId);
    }
  })();

  productDetailRequestCache.set(productId, request);
  return request;
}

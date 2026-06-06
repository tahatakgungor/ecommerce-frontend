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
const PRODUCT_DETAIL_CACHE_KEY = "catalog_product_detail_cache_v1";
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

function buildProductMap(products: CatalogProduct[]) {
  return products.reduce<Record<string, CatalogProduct>>((accumulator, product) => {
    if (product.id) {
      accumulator[product.id] = product;
    }
    return accumulator;
  }, {});
}

async function readCatalogCache() {
  return readJsonValue<CatalogSnapshot | null>(CATALOG_CACHE_KEY, null);
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
  const cachedSnapshot = await readCatalogCache();
  if (cachedSnapshot?.products?.length) {
    return applyCatalogQuery(cachedSnapshot, query);
  }

  const bundledSnapshot = normalizeSnapshot(BUNDLED_CATALOG_FALLBACK);
  if (bundledSnapshot.products.length) {
    return applyCatalogQuery(bundledSnapshot, query);
  }

  return null;
}

export async function getLocalProductDetail(productId: string) {
  const productDetailCache = await readJsonValue<Record<string, CatalogProduct>>(PRODUCT_DETAIL_CACHE_KEY, {});
  if (productDetailCache[productId]) {
    return productDetailCache[productId];
  }

  const cachedSnapshot = await readCatalogCache();
  const catalogProduct = cachedSnapshot?.products?.find((product) => product.id === productId);
  if (catalogProduct) {
    return catalogProduct;
  }

  const bundledSnapshot = normalizeSnapshot(BUNDLED_CATALOG_FALLBACK);
  return bundledSnapshot.products.find((product) => product.id === productId) || null;
}

export async function fetchCatalogSnapshot(query: CatalogQuery = {}): Promise<CatalogSnapshot> {
  try {
    const payload = await fetchJson<RawCatalogResponse>(`/api/products/show?${buildCatalogQueryParams(query)}`, {
      timeoutMs: 6000,
    });
    const snapshot = normalizeSnapshot(payload);
    await writeJsonValue(CATALOG_CACHE_KEY, snapshot);
    await writeJsonValue(PRODUCT_DETAIL_CACHE_KEY, buildProductMap(snapshot.products));
    return snapshot;
  } catch (error) {
    const localSnapshot = await getLocalCatalogSnapshot(query);
    if (localSnapshot) {
      return localSnapshot;
    }

    throw error;
  }
}

type ProductEnvelope = {
  data?: RawProductResponse;
  result?: RawProductResponse;
};

export async function fetchProductDetail(productId: string): Promise<CatalogProduct> {
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
    await writeProductDetailCache(normalizedProduct);
    return normalizedProduct;
  } catch (error) {
    const localProduct = await getLocalProductDetail(productId);
    if (localProduct) {
      return localProduct;
    }

    throw error;
  }
}

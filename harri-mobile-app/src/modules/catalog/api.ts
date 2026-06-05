import { runtimeConfig } from "@/config/runtime";
import type { CatalogCategory, CatalogProduct, CatalogSnapshot } from "@/modules/catalog/types";

type RawCatalogResponse = {
  total?: number;
  page?: number;
  size?: number;
  products?: Array<Record<string, unknown>>;
  facets?: {
    brands?: Array<{ name?: string } | string>;
  };
};

function toStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readImageUrl(raw: Record<string, unknown>) {
  const imageUrl = toStringValue(raw.img);
  if (imageUrl) return imageUrl;

  const imageArray = raw.imageURLs;
  if (Array.isArray(imageArray) && typeof imageArray[0] === "string") {
    return imageArray[0];
  }

  const photo = raw.photo;
  if (typeof photo === "string" && photo) {
    return photo;
  }

  return null;
}

function formatPrice(rawPrice: unknown) {
  const numericPrice = typeof rawPrice === "number" ? rawPrice : Number(rawPrice || 0);
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numericPrice) ? numericPrice : 0);
}

function mapProduct(raw: Record<string, unknown>): CatalogProduct {
  return {
    id: String(raw._id || raw.id || raw.slug || Math.random()),
    title: toStringValue(raw.title) || toStringValue(raw.name) || "Urun",
    brand: toStringValue(raw.brand) || "Marka",
    category:
      toStringValue((raw.category as { name?: string } | undefined)?.name) ||
      toStringValue(raw.parent) ||
      "Kategori",
    imageUrl: readImageUrl(raw),
    priceText: formatPrice(raw.price),
  };
}

function buildCategories(products: CatalogProduct[]): CatalogCategory[] {
  const counts = new Map<string, number>();
  products.forEach((product) => {
    const key = product.category || "Kategori";
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([parent, count]) => ({ parent, count }))
    .sort((left, right) => right.count - left.count);
}

function buildBrands(rawBrands?: Array<{ name?: string } | string>) {
  if (!Array.isArray(rawBrands)) return [];
  return rawBrands
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object" && typeof entry.name === "string") return entry.name;
      return "";
    })
    .filter(Boolean);
}

export async function fetchCatalogSnapshot(page = 1, size = 8): Promise<CatalogSnapshot> {
  if (!runtimeConfig.apiBaseUrl) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL missing");
  }

  const url = new URL(`${runtimeConfig.apiBaseUrl}/api/products/show`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));
  url.searchParams.set("includeFacets", "true");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Catalog request failed with ${response.status}`);
  }

  const payload = (await response.json()) as RawCatalogResponse;
  const products = Array.isArray(payload.products) ? payload.products.map(mapProduct) : [];

  return {
    total: payload.total || products.length,
    page: payload.page || page,
    size: payload.size || size,
    products,
    categories: buildCategories(products),
    brands: buildBrands(payload.facets?.brands),
  };
}

export const CATALOG_SORT = {
  latest: "latest",
  priceAsc: "price_asc",
  priceDesc: "price_desc",
} as const;

export type CatalogSort = (typeof CATALOG_SORT)[keyof typeof CATALOG_SORT];

export type CatalogQuery = {
  page?: number;
  size?: number;
  q?: string;
  parentCategory?: string | null;
  category?: string[] | string | null;
  brand?: string[] | string | null;
  sort?: CatalogSort | string | null;
  includeFacets?: boolean;
  categoryItems?: Array<{ parent?: string; children?: string[] }>;
};

const TURKISH_CHAR_MAP: Record<string, string> = {
  Ç: "c",
  ç: "c",
  Ğ: "g",
  ğ: "g",
  İ: "i",
  I: "i",
  ı: "i",
  Ö: "o",
  ö: "o",
  Ş: "s",
  ş: "s",
  Ü: "u",
  ü: "u",
};

function normalizeTurkishChars(value: string) {
  return value
    .split("")
    .map((char) => TURKISH_CHAR_MAP[char] || char)
    .join("");
}

export function toFilterSlug(value: string | null | undefined) {
  return normalizeTurkishChars(String(value || ""))
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeFilterValues(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeFilterValues(item)).filter(Boolean);
  }

  if (value === null || value === undefined || value === "") {
    return [];
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeCategoryFilters(value: string[] | string | null | undefined): string[] {
  return [...new Set(normalizeFilterValues(value).map((item: string) => toFilterSlug(item)).filter(Boolean))];
}

export function normalizeBrandFilters(value: string[] | string | null | undefined): string[] {
  return [...new Set(normalizeFilterValues(value).map((item: string) => toFilterSlug(item)).filter(Boolean))];
}

export function normalizeCatalogSort(value: CatalogSort | string | null | undefined): CatalogSort {
  switch (String(value || "").trim().toLowerCase()) {
    case "price_asc":
    case "price low to high":
    case "price-low-to-high":
      return CATALOG_SORT.priceAsc;
    case "price_desc":
    case "price high to low":
    case "price-high-to-low":
      return CATALOG_SORT.priceDesc;
    default:
      return CATALOG_SORT.latest;
  }
}

export function resolveCategoryScope(
  parentCategory: string | null | undefined,
  categoryItems: CatalogQuery["categoryItems"] = []
) {
  const parentSlug = toFilterSlug(parentCategory);
  if (!parentSlug || !Array.isArray(categoryItems)) {
    return "";
  }

  const matchedParent = categoryItems.find((item) => toFilterSlug(item?.parent) === parentSlug);
  if (!matchedParent || !Array.isArray(matchedParent.children)) {
    return "";
  }

  return matchedParent.children.filter(Boolean).join(",");
}

export function buildCatalogQueryParams(query: CatalogQuery = {}) {
  const params = new URLSearchParams();

  const page = Math.max(1, Number(query.page || 1));
  const size = Math.max(1, Number(query.size || 12));
  const normalizedSort = normalizeCatalogSort(query.sort);
  const normalizedParent = toFilterSlug(query.parentCategory);
  const normalizedCategories = normalizeCategoryFilters(query.category);
  const normalizedBrands = normalizeBrandFilters(query.brand);
  const normalizedQuery = String(query.q || "").trim();

  if (normalizedQuery) {
    params.set("q", normalizedQuery);
  }
  if (normalizedParent) {
    params.set("Category", normalizedParent);
  }
  if (normalizedCategories.length) {
    params.set("category", normalizedCategories.join(","));
  }
  if (normalizedBrands.length) {
    params.set("brand", normalizedBrands.join(","));
  }
  if (normalizedSort !== CATALOG_SORT.latest) {
    params.set("sort", normalizedSort);
  }

  params.set("page", String(page));
  params.set("size", String(size));
  params.set("includeFacets", String(query.includeFacets !== false));

  const categoryScope = resolveCategoryScope(normalizedParent, query.categoryItems);
  if (categoryScope) {
    params.set("categoryScope", categoryScope);
  }

  return params.toString();
}

export function serializeCatalogQuery(query: CatalogQuery = {}) {
  return buildCatalogQueryParams(query);
}

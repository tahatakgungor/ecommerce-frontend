import { normalizeBrandFilters, toFilterSlug } from "./shop-filters";

export const CATALOG_SORT = {
  latest: "latest",
  priceAsc: "price_asc",
  priceDesc: "price_desc",
};

export function normalizeCatalogSort(value) {
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

export function getSortValueForSelect(sort) {
  switch (normalizeCatalogSort(sort)) {
    case CATALOG_SORT.priceAsc:
      return "Price low to high";
    case CATALOG_SORT.priceDesc:
      return "Price high to low";
    default:
      return "Latest Product";
  }
}

export function getCatalogSortFromSelect(value) {
  return normalizeCatalogSort(value);
}

export function resolveCategoryScope(Category, categoryItems = []) {
  const parentSlug = toFilterSlug(Category);
  if (!parentSlug || !Array.isArray(categoryItems)) {
    return "";
  }

  const matchedParent = categoryItems.find((item) => toFilterSlug(item?.parent) === parentSlug);
  if (!matchedParent || !Array.isArray(matchedParent.children)) {
    return "";
  }

  return matchedParent.children.filter(Boolean).join(",");
}

export function buildCatalogQueryParams({
  q,
  Category,
  category,
  brand,
  priceMin,
  max,
  priceMax,
  sort,
  page,
  size,
  includeFacets = true,
  categoryItems,
} = {}) {
  const params = {};

  if (q) {
    params.q = String(q).trim();
  }
  if (Category) {
    params.Category = Category;
  }
  if (category) {
    params.category = category;
  }

  const normalizedBrands = normalizeBrandFilters(brand);
  if (normalizedBrands.length) {
    params.brand = normalizedBrands.join(",");
  }

  if (priceMin !== null && priceMin !== undefined && priceMin !== "") {
    params.priceMin = priceMin;
  }
  if (max !== null && max !== undefined && max !== "") {
    params.max = max;
  }
  if (priceMax !== null && priceMax !== undefined && priceMax !== "") {
    params.priceMax = priceMax;
  }
  if (sort) {
    params.sort = normalizeCatalogSort(sort);
  }
  if (page) {
    params.page = page;
  }
  if (size) {
    params.size = size;
  }

  const categoryScope = resolveCategoryScope(Category, categoryItems);
  if (categoryScope) {
    params.categoryScope = categoryScope;
  }

  params.includeFacets = includeFacets;
  return params;
}

export function buildBrandLabelLookup(brandOptions = []) {
  return (Array.isArray(brandOptions) ? brandOptions : []).reduce((acc, option) => {
    if (option?.slug && option?.name) {
      acc[option.slug] = option.name;
    }
    return acc;
  }, {});
}

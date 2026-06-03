const TURKISH_CHAR_MAP = {
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

function normalizeTurkishChars(value) {
  return String(value || "")
    .split("")
    .map((char) => TURKISH_CHAR_MAP[char] || char)
    .join("");
}

export function toFilterSlug(value) {
  return normalizeTurkishChars(value)
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeFilterValues(value) {
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

export function normalizeBrandFilters(value) {
  return [...new Set(normalizeFilterValues(value).map((item) => toFilterSlug(item)).filter(Boolean))];
}

function toFiniteNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function resolvePriceFilters(filters = {}) {
  const explicitMin = toFiniteNumber(filters.priceMin);
  const explicitMax = toFiniteNumber(filters.max);
  const legacyOpenEndedMin = explicitMin === null ? toFiniteNumber(filters.priceMax) : null;

  let minPrice = explicitMin ?? legacyOpenEndedMin;
  let maxPrice = explicitMax;

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  return {
    minPrice,
    maxPrice,
    hasPriceFilter: minPrice !== null || maxPrice !== null,
  };
}

function getCategoryCandidates(product) {
  const candidates = [
    product?.children,
    product?.category?.name,
    product?.category,
    product?.parent,
    product?.title,
    product?.subcategory,
    product?.form,
    ...(Array.isArray(product?.tags) ? product.tags : []),
  ];
  return candidates.filter(Boolean);
}

function findParentCategoryMeta(categoryItems, parentSlug) {
  if (!Array.isArray(categoryItems) || !parentSlug) return null;
  return (
    categoryItems.find((item) => {
      const itemParentSlug = toFilterSlug(item?.parent);
      const itemNameSlug = toFilterSlug(item?.name);
      return itemParentSlug === parentSlug || itemNameSlug === parentSlug;
    }) || null
  );
}

function matchesParentCategory(product, parentSlug, categoryItems) {
  if (!parentSlug) return true;

  const productParentSlug = toFilterSlug(product?.parent);
  if (
    productParentSlug === parentSlug ||
    productParentSlug.includes(parentSlug) ||
    parentSlug.includes(productParentSlug)
  ) {
    return true;
  }

  const matchedParent = findParentCategoryMeta(categoryItems, parentSlug);
  if (!matchedParent) {
    return false;
  }

  const allowedChildSlugs = (matchedParent.children || [])
    .map((child) => toFilterSlug(child))
    .filter(Boolean);

  if (!allowedChildSlugs.length) {
    return false;
  }

  return getCategoryCandidates(product).some((candidate) =>
    allowedChildSlugs.includes(toFilterSlug(candidate))
  );
}

export function buildShopRoute(searchParams, updates = {}) {
  const params = new URLSearchParams(searchParams?.toString?.() || "");
  Object.entries(updates).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const normalizedValue = value
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .join(",");

      if (!normalizedValue) {
        params.delete(key);
        return;
      }

      params.set(key, normalizedValue);
      return;
    }

    if (value === null || value === undefined || value === "") {
      params.delete(key);
      return;
    }
    params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}

export function applyShopFilters(products, filters = {}) {
  const {
    Category,
    category,
    brand,
    color,
    priceMin,
    max,
    priceMax,
    shortValue,
    categoryItems,
  } = filters;

  let productItems = Array.isArray(products) ? [...products] : [];

  if (Category) {
    const parentSlug = toFilterSlug(Category);
    productItems = productItems.filter((product) =>
      matchesParentCategory(product, parentSlug, categoryItems)
    );
  }

  if (category) {
    const targetSlug = toFilterSlug(category);
    productItems = productItems.filter((product) =>
      getCategoryCandidates(product).some((candidate) => {
        const candidateSlug = toFilterSlug(candidate);
        return (
          candidateSlug === targetSlug ||
          candidateSlug.includes(targetSlug)
        );
      })
    );
  }

  const selectedBrands = normalizeBrandFilters(brand);
  if (selectedBrands.length) {
    const selectedBrandSet = new Set(selectedBrands);
    productItems = productItems.filter((product) =>
      selectedBrandSet.has(toFilterSlug(product?.brand?.name))
    );
  }

  if (color) {
    productItems = productItems.filter((product) =>
      Array.isArray(product?.colors) ? product.colors.includes(color) : false
    );
  }

  const { minPrice, maxPrice, hasPriceFilter } = resolvePriceFilters({
    priceMin,
    max,
    priceMax,
  });

  if (hasPriceFilter) {
    productItems = productItems.filter((product) => {
      const price = Number(product?.originalPrice);
      if (!Number.isFinite(price)) return false;
      if (minPrice !== null && price < minPrice) return false;
      if (maxPrice !== null && price > maxPrice) return false;
      return true;
    });
  }

  if (shortValue === "Latest Product") {
    return productItems.filter((product) => product?.itemInfo === "latest-product");
  }

  if (shortValue === "Price low to high") {
    return productItems.slice().sort((a, b) => Number(a.originalPrice) - Number(b.originalPrice));
  }

  if (shortValue === "Price high to low") {
    return productItems.slice().sort((a, b) => Number(b.originalPrice) - Number(a.originalPrice));
  }

  return productItems;
}

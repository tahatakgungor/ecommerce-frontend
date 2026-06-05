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

export function normalizeCategoryFilters(value) {
  return [...new Set(normalizeFilterValues(value).map((item) => toFilterSlug(item)).filter(Boolean))];
}

function toFiniteNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function getFilterablePrice(product) {
  const originalPrice = Number(product?.originalPrice);
  if (Number.isFinite(originalPrice) && originalPrice >= 0) {
    return originalPrice;
  }

  const fallbackPrice = Number(product?.price);
  if (Number.isFinite(fallbackPrice) && fallbackPrice >= 0) {
    return fallbackPrice;
  }

  return null;
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

function omitFilterKeys(filters, omittedKeys = []) {
  const omittedKeySet = new Set(omittedKeys);

  return Object.entries(filters || {}).reduce((acc, [key, value]) => {
    if (!omittedKeySet.has(key)) {
      acc[key] = value;
    }
    return acc;
  }, {});
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

export function getFacetScopedProducts(products, filters = {}, omittedKeys = []) {
  return applyShopFilters(products, omitFilterKeys(filters, omittedKeys));
}

export function getCatalogPriceBounds(products) {
  const prices = (Array.isArray(products) ? products : [])
    .map((product) => getFilterablePrice(product))
    .filter((price) => Number.isFinite(price))
    .sort((left, right) => left - right);

  if (!prices.length) {
    return { min: 0, max: 0 };
  }

  return {
    min: prices[0],
    max: prices[prices.length - 1],
  };
}

function getNiceStep(value) {
  if (!Number.isFinite(value) || value <= 0) return 1;

  const exponent = Math.floor(Math.log10(value));
  const magnitude = 10 ** exponent;
  const fraction = value / magnitude;

  if (fraction <= 1) return magnitude;
  if (fraction <= 2) return 2 * magnitude;
  if (fraction <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

export function getPriceUiBoundsFromRange(min, max) {
  if (max <= min) {
    return {
      min: Math.max(0, Math.floor(min)),
      max: Math.max(0, Math.ceil(max)),
    };
  }

  const spread = max - min;
  const step = getNiceStep(spread / 4);

  return {
    min: Math.max(0, Math.floor(min / step) * step),
    max: Math.max(step, Math.ceil(max / step) * step),
  };
}

export function getPriceUiBounds(products) {
  const { min, max } = getCatalogPriceBounds(products);
  return getPriceUiBoundsFromRange(min, max);
}

export function createPricePresetRanges(minPrice, maxPrice) {
  if (maxPrice <= minPrice) {
    return [{ id: "all", min: Math.max(0, Math.floor(minPrice)), max: null }];
  }

  const spread = maxPrice - minPrice;
  const step = getNiceStep(spread / 4);
  const normalizedMin = Math.max(0, Math.floor(minPrice / step) * step);
  const normalizedMax = Math.max(step, Math.ceil(maxPrice / step) * step);
  const ranges = [];

  for (let index = 0; index < 3; index += 1) {
    const rangeMin = normalizedMin + index * step;
    const rangeMax = Math.min(normalizedMax - 1, rangeMin + step - 1);

    if (rangeMin >= normalizedMax || rangeMin > rangeMax) {
      break;
    }

    ranges.push({
      id: `range-${index + 1}`,
      min: rangeMin,
      max: rangeMax,
    });
  }

  const openEndedMin = normalizedMin + ranges.length * step;
  if (!ranges.length || openEndedMin <= normalizedMax) {
    ranges.push({
      id: `range-${ranges.length + 1}`,
      min: openEndedMin,
      max: null,
    });
  }

  return ranges;
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

  const selectedCategories = normalizeCategoryFilters(category);
  if (selectedCategories.length) {
    const selectedCategorySet = new Set(selectedCategories);
    productItems = productItems.filter((product) =>
      getCategoryCandidates(product).some((candidate) => {
        const candidateSlug = toFilterSlug(candidate);
        return Array.from(selectedCategorySet).some((targetSlug) =>
          candidateSlug === targetSlug || candidateSlug.includes(targetSlug)
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
      const price = getFilterablePrice(product);
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

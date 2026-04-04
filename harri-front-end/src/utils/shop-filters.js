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

export function buildShopRoute(searchParams, updates = {}) {
  const params = new URLSearchParams(searchParams?.toString?.() || "");
  Object.entries(updates).forEach(([key, value]) => {
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
  } = filters;

  let productItems = Array.isArray(products) ? [...products] : [];

  if (Category) {
    productItems = productItems.filter((product) =>
      toFilterSlug(product?.parent).includes(toFilterSlug(Category))
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

  if (brand) {
    productItems = productItems.filter(
      (product) => toFilterSlug(product?.brand?.name) === toFilterSlug(brand)
    );
  }

  if (color) {
    productItems = productItems.filter((product) =>
      Array.isArray(product?.colors) ? product.colors.includes(color) : false
    );
  }

  if (priceMin || max || priceMax) {
    productItems = productItems.filter((product) => {
      const price = Number(product?.originalPrice);
      const minPrice = Number(priceMin);
      const maxPrice = Number(max);
      if (!priceMax && priceMin && max) {
        return price >= minPrice && price <= maxPrice;
      }
      if (priceMax) {
        return price >= Number(priceMax);
      }
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

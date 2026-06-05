function toStringValue(value) {
  return typeof value === "string" ? value : "";
}

function toNumberValue(value, fallback = 0) {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function readImageUrl(raw) {
  const imageUrl = toStringValue(raw?.img || raw?.image);
  if (imageUrl) return imageUrl;

  if (Array.isArray(raw?.imageURLs) && typeof raw.imageURLs[0] === "string") {
    return raw.imageURLs[0];
  }

  if (Array.isArray(raw?.relatedImages) && typeof raw.relatedImages[0] === "string") {
    return raw.relatedImages[0];
  }

  return null;
}

export function formatTryPrice(rawPrice) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(toNumberValue(rawPrice, 0));
}

export function normalizeProduct(rawProduct) {
  const brandName = toStringValue(rawProduct?.brand?.name || rawProduct?.brand);
  const categoryName = toStringValue(rawProduct?.category?.name);
  const parentCategory = toStringValue(rawProduct?.parent);
  const colors = Array.isArray(rawProduct?.colors)
    ? rawProduct.colors.filter((entry) => typeof entry === "string")
    : [];
  const relatedImages = Array.isArray(rawProduct?.relatedImages)
    ? rawProduct.relatedImages.filter((entry) => typeof entry === "string")
    : [];

  return {
    id: String(rawProduct?._id || rawProduct?.id || ""),
    title: toStringValue(rawProduct?.title || rawProduct?.name) || "Urun",
    description: toStringValue(rawProduct?.description),
    brand: brandName || "Marka",
    category: categoryName || parentCategory || "Kategori",
    parentCategory,
    childCategory: toStringValue(rawProduct?.children),
    imageUrl: readImageUrl(rawProduct),
    gallery: relatedImages,
    price: toNumberValue(rawProduct?.price, 0),
    priceText: formatTryPrice(rawProduct?.price),
    originalPrice: toNumberValue(rawProduct?.originalPrice, toNumberValue(rawProduct?.price, 0)),
    originalPriceText: formatTryPrice(
      rawProduct?.originalPrice ?? rawProduct?.price
    ),
    discount: toNumberValue(rawProduct?.discount, 0),
    stockQuantity: toNumberValue(rawProduct?.quantity, 0),
    tags: Array.isArray(rawProduct?.tags)
      ? rawProduct.tags.filter((entry) => typeof entry === "string")
      : [],
    colors,
    sku: toStringValue(rawProduct?.sku),
    status: toStringValue(rawProduct?.status),
  };
}

export function normalizeCatalogSnapshot(rawCatalogResponse) {
  const products = Array.isArray(rawCatalogResponse?.products)
    ? rawCatalogResponse.products.map(normalizeProduct)
    : [];

  const brandEntries = Array.isArray(rawCatalogResponse?.facets?.brands)
    ? rawCatalogResponse.facets.brands
    : [];

  const categoryCounts = new Map();
  products.forEach((product) => {
    const key = product.category || "Kategori";
    categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1);
  });

  return {
    total: toNumberValue(rawCatalogResponse?.total, products.length),
    page: toNumberValue(rawCatalogResponse?.page, 1),
    size: toNumberValue(rawCatalogResponse?.size, products.length),
    totalPages: toNumberValue(rawCatalogResponse?.totalPages, 1),
    products,
    brands: brandEntries
      .map((entry) => {
        if (typeof entry === "string") return entry;
        if (entry && typeof entry === "object" && typeof entry.name === "string") return entry.name;
        return "";
      })
      .filter(Boolean),
    categories: Array.from(categoryCounts.entries())
      .map(([parent, count]) => ({ parent, count }))
      .sort((left, right) => right.count - left.count),
    priceBounds: {
      min: toNumberValue(rawCatalogResponse?.priceBounds?.min, 0),
      max: toNumberValue(rawCatalogResponse?.priceBounds?.max, 0),
    },
  };
}

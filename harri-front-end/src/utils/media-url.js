const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export function normalizeMediaUrl(url) {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("/")) {
    return API_BASE_URL ? `${API_BASE_URL}${trimmed}` : trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (parsed.protocol === "http:" && host.endsWith(".railway.app")) {
      parsed.protocol = "https:";
      return parsed.toString();
    }
    if ((host === "localhost" || host === "127.0.0.1") && API_BASE_URL) {
      return `${API_BASE_URL}${parsed.pathname}${parsed.search || ""}${parsed.hash || ""}`;
    }
    return parsed.toString();
  } catch {
    return API_BASE_URL ? `${API_BASE_URL}/${trimmed.replace(/^\/+/, "")}` : trimmed;
  }
}

export function buildProductGalleryImages(product) {
  const values = [product?.image, ...(Array.isArray(product?.relatedImages) ? product.relatedImages : [])]
    .map((img) => normalizeMediaUrl(img))
    .filter(Boolean);
  return Array.from(new Set(values));
}

export function normalizeProductMedia(product) {
  if (!product || typeof product !== "object") return product;
  return {
    ...product,
    image: normalizeMediaUrl(product.image),
    relatedImages: Array.isArray(product.relatedImages)
      ? product.relatedImages.map((img) => normalizeMediaUrl(img)).filter(Boolean)
      : [],
  };
}

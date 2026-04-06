const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
export const PRODUCT_IMAGE_FALLBACK = "/assets/img/product/product-1.jpg";

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

export function isExternalMediaUrl(url) {
  if (!url || typeof url !== "string") return false;
  return /^https?:\/\//i.test(url.trim());
}

export function buildCloudinaryImageUrl(url, options = {}) {
  if (!url) return "";
  const normalized = normalizeMediaUrl(url);
  if (!normalized) return "";

  try {
    const parsed = new URL(normalized);
    if (!parsed.hostname.toLowerCase().includes("res.cloudinary.com")) {
      return normalized;
    }

    const marker = "/upload/";
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex < 0) {
      return normalized;
    }

    const {
      width,
      height,
      fit = "limit",
      quality = "auto:best",
      format = "auto",
      dpr = "auto",
      sharpen = false,
    } = options;

    const transforms = [];
    if (width) transforms.push(`w_${Math.max(1, Number(width))}`);
    if (height) transforms.push(`h_${Math.max(1, Number(height))}`);
    if (fit) transforms.push(`c_${fit}`);
    if (quality) transforms.push(`q_${quality}`);
    if (format) transforms.push(`f_${format}`);
    if (dpr) transforms.push(`dpr_${dpr}`);
    if (sharpen) transforms.push("e_sharpen:100");

    const before = parsed.pathname.slice(0, markerIndex + marker.length);
    const after = parsed.pathname.slice(markerIndex + marker.length);
    parsed.pathname = `${before}${transforms.join(",")}/${after}`;
    return parsed.toString();
  } catch {
    return normalized;
  }
}

export function buildImageErrorFallbackHandler(fallback = PRODUCT_IMAGE_FALLBACK) {
  return (event) => {
    const img = event?.currentTarget;
    if (!img || img.dataset?.fallbackApplied === "1") return;
    img.dataset.fallbackApplied = "1";
    img.src = fallback;
  };
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

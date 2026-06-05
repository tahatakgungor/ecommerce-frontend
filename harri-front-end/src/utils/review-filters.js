export function buildReviewQueryParams({
  productId,
  sort = "newest",
  withMedia = false,
  exactRating = null,
  minRating = null,
  verifiedOnly = false,
  page = 0,
  size = 10,
}) {
  const params = new URLSearchParams();
  const normalizedPage = Number.isFinite(Number(page)) ? Number(page) : 0;
  const normalizedSize = Number.isFinite(Number(size)) ? Number(size) : 10;
  params.set("sort", sort || "newest");
  params.set("withMedia", String(Boolean(withMedia)));
  params.set("verifiedOnly", String(Boolean(verifiedOnly)));
  params.set("page", String(Math.max(0, normalizedPage)));
  params.set("size", String(Math.max(1, normalizedSize)));

  if (productId) {
    params.set("productId", String(productId));
  }

  if (exactRating !== null && exactRating !== undefined && exactRating !== "") {
    const normalized = Math.min(5, Math.max(1, Number(exactRating) || 0));
    if (normalized > 0) {
      params.set("exactRating", String(normalized));
    }
  }

  if (minRating !== null && minRating !== undefined && minRating !== "") {
    const normalized = Math.min(5, Math.max(1, Number(minRating) || 0));
    if (normalized > 0) {
      params.set("minRating", String(normalized));
    }
  }

  return params;
}

export function getActiveReviewFilterChips({ lang = "tr", sort = "newest", withMedia = false, exactRating = null, minRating = null, verifiedOnly = false }) {
  const chips = [];

  if (sort === "highest") {
    chips.push({ key: "sort", label: lang === "tr" ? "En yüksek puan" : "Highest rated" });
  } else if (sort === "most_helpful") {
    chips.push({ key: "sort", label: lang === "tr" ? "En faydalı" : "Most helpful" });
  }

  if (withMedia) {
    chips.push({ key: "withMedia", label: lang === "tr" ? "Fotoğraflı" : "With media" });
  }

  if (verifiedOnly) {
    chips.push({ key: "verifiedOnly", label: lang === "tr" ? "Doğrulanmış alıcı" : "Verified purchase" });
  }

  if (exactRating) {
    chips.push({
      key: "exactRating",
      label: lang === "tr" ? `${exactRating} yıldız` : `${exactRating} stars`,
    });
  }

  if (minRating) {
    chips.push({
      key: "minRating",
      label: lang === "tr" ? `${minRating}+ yıldız` : `${minRating}+ stars`,
    });
  }

  return chips;
}

export function hasActiveReviewFilters(filters) {
  return getActiveReviewFilterChips(filters).length > 0;
}

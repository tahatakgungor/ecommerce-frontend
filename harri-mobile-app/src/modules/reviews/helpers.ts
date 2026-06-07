import { normalizeCatalogMediaUrl } from "@/modules/catalog/media-url";
import { formatOrderDate } from "@/modules/orders/helpers";
import type { RawReviewOverview, RawReviewRow, ReviewEntry, ReviewModerationStatus, ReviewOverview } from "@/modules/reviews/types";

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readRating(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value || 0);
  if (!Number.isFinite(numeric)) {
    return 5;
  }
  return Math.min(5, Math.max(1, Math.round(numeric)));
}

function normalizeStatus(rawStatus: string): ReviewModerationStatus {
  const safeStatus = rawStatus.trim().toUpperCase();
  if (safeStatus === "APPROVED") return "APPROVED";
  if (safeStatus === "PENDING") return "PENDING";
  if (safeStatus === "REJECTED") return "REJECTED";
  return "UNKNOWN";
}

export function getReviewStatusMeta(rawStatus: string) {
  const status = normalizeStatus(rawStatus);

  if (status === "APPROVED") {
    return {
      status,
      label: "Onaylandı",
      backgroundColor: "#eaf8ef",
      borderColor: "#96d5a9",
      textColor: "#1f6a38",
    };
  }

  if (status === "REJECTED") {
    return {
      status,
      label: "Reddedildi",
      backgroundColor: "#fff1f1",
      borderColor: "#f2a6a6",
      textColor: "#a52a2a",
    };
  }

  if (status === "PENDING") {
    return {
      status,
      label: "Onay Bekliyor",
      backgroundColor: "#fff6e8",
      borderColor: "#efc17c",
      textColor: "#9a5b13",
    };
  }

  return {
    status,
    label: "Durum Güncelleniyor",
    backgroundColor: "#f3f5f2",
    borderColor: "#d5ddd2",
    textColor: "#516052",
  };
}

function pickCandidateList(rawOverview: RawReviewOverview, keys: Array<keyof RawReviewOverview>) {
  for (const key of keys) {
    const candidate = rawOverview[key];
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  for (const key of keys) {
    if (rawOverview.data && key in rawOverview.data) {
      const candidate = rawOverview.data[key as keyof NonNullable<RawReviewOverview["data"]>];
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }
  }

  for (const key of keys) {
    if (rawOverview.result && key in rawOverview.result) {
      const candidate = rawOverview.result[key as keyof NonNullable<RawReviewOverview["result"]>];
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }
  }

  return [];
}

export function normalizeReviewEntry(rawRow: RawReviewRow): ReviewEntry | null {
  const rawReview = rawRow.review || {};
  const productId = readString(rawRow.productId) || readString(rawReview.productId);
  if (!productId) {
    return null;
  }

  const reviewId = readString(rawReview.reviewId) || readString(rawRow.reviewId);
  const updatedAt = readString(rawReview.updatedAt) || readString(rawRow.updatedAt);
  const statusMeta = getReviewStatusMeta(readString(rawReview.status) || readString(rawRow.status));

  return {
    productId,
    orderId: readString(rawRow.orderId),
    title: readString(rawRow.title) || readString(rawRow.productTitle) || "Ürün",
    imageUrl: normalizeCatalogMediaUrl(
      readString(rawRow.image) ||
        readString(rawRow.productImage) ||
        readString((rawRow as RawReviewRow & { imageUrl?: string }).imageUrl) ||
        readString((rawRow as RawReviewRow & { img?: string }).img) ||
        null
    ),
    reviewId,
    rating: readRating(rawReview.rating || rawRow.rating || 5),
    commentTitle: readString(rawReview.commentTitle) || readString(rawRow.commentTitle),
    commentBody: readString(rawReview.commentBody) || readString(rawRow.commentBody),
    mediaUrls: Array.isArray(rawReview.mediaUrls)
      ? rawReview.mediaUrls.filter((item): item is string => typeof item === "string" && item.length > 0)
      : Array.isArray(rawRow.mediaUrls)
      ? rawRow.mediaUrls.filter((item): item is string => typeof item === "string" && item.length > 0)
      : [],
    status: statusMeta.status,
    statusLabel: statusMeta.label,
    updatedAt,
    updatedAtText: updatedAt ? formatOrderDate(updatedAt) : "Henüz güncellenmedi",
    hasReview: Boolean(reviewId),
  };
}

function sortEntries(entries: ReviewEntry[]) {
  return [...entries].sort((left, right) => {
    const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
    const rightTime = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
    return rightTime - leftTime;
  });
}

export function normalizeReviewOverview(rawOverview: RawReviewOverview | null | undefined): ReviewOverview {
  if (!rawOverview || typeof rawOverview !== "object") {
    return { pending: [], reviewed: [] };
  }

  const pending = pickCandidateList(rawOverview, ["pending", "pendingReviews", "pendingProducts"])
    .map(normalizeReviewEntry)
    .filter(Boolean) as ReviewEntry[];
  const reviewed = pickCandidateList(rawOverview, ["reviewed", "reviews", "myReviews"])
    .map(normalizeReviewEntry)
    .filter(Boolean) as ReviewEntry[];

  return {
    pending: sortEntries(pending),
    reviewed: sortEntries(reviewed),
  };
}

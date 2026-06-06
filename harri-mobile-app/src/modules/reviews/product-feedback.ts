import { startTransition, useEffect, useState } from "react";

import { fetchJson } from "@/lib/http-client";
import { formatOrderDate } from "@/modules/orders/helpers";

export type ProductReviewSummary = {
  averageRating: number;
  totalReviews: number;
};

export type ProductReviewEntry = {
  reviewId: string;
  productId: string;
  userName: string;
  rating: number;
  commentTitle: string;
  commentBody: string;
  verifiedPurchase: boolean;
  createdAt: string;
  createdAtText: string;
  helpfulCount: number;
  mediaUrls: string[];
};

type RawReviewSummaryResponse = {
  data?: {
    averageRating?: number;
    totalReviews?: number;
  };
  result?: {
    averageRating?: number;
    totalReviews?: number;
  };
  averageRating?: number;
  totalReviews?: number;
};

type RawProductReviewResponse = {
  reviewId?: string;
  productId?: string;
  userName?: string;
  rating?: number;
  commentTitle?: string;
  commentBody?: string;
  verifiedPurchase?: boolean;
  createdAt?: string;
  helpfulCount?: number;
  mediaUrls?: string[];
};

type RawProductReviewListResponse = {
  data?: {
    reviews?: RawProductReviewResponse[];
  };
  result?: {
    reviews?: RawProductReviewResponse[];
  };
  reviews?: RawProductReviewResponse[];
};

type ReviewState<T> = {
  data: T;
  isLoading: boolean;
  error: string | null;
};

const emptySummary: ProductReviewSummary = {
  averageRating: 0,
  totalReviews: 0,
};

const summaryCache = new Map<string, ProductReviewSummary>();
const reviewListCache = new Map<string, ProductReviewEntry[]>();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readNumber(value: unknown, fallback = 0) {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function supportsReviewLookup(productId: string) {
  return UUID_PATTERN.test(productId.trim());
}

function normalizeReviewSummary(response: RawReviewSummaryResponse | null | undefined): ProductReviewSummary {
  const source = response?.data || response?.result || response || {};
  return {
    averageRating: Math.max(0, Math.min(5, readNumber(source.averageRating, 0))),
    totalReviews: Math.max(0, readNumber(source.totalReviews, 0)),
  };
}

function normalizeReviewEntry(rawReview: RawProductReviewResponse): ProductReviewEntry {
  const createdAt = readString(rawReview.createdAt);
  return {
    reviewId: readString(rawReview.reviewId),
    productId: readString(rawReview.productId),
    userName: readString(rawReview.userName) || "Müşteri",
    rating: Math.max(1, Math.min(5, Math.round(readNumber(rawReview.rating, 5)))),
    commentTitle: readString(rawReview.commentTitle),
    commentBody: readString(rawReview.commentBody),
    verifiedPurchase: Boolean(rawReview.verifiedPurchase),
    createdAt,
    createdAtText: createdAt ? formatOrderDate(createdAt) : "",
    helpfulCount: Math.max(0, readNumber(rawReview.helpfulCount, 0)),
    mediaUrls: Array.isArray(rawReview.mediaUrls)
      ? rawReview.mediaUrls.filter((item): item is string => typeof item === "string" && item.length > 0)
      : [],
  };
}

function normalizeReviewList(response: RawProductReviewListResponse | null | undefined) {
  const source = response?.data || response?.result || response || {};
  const reviews = Array.isArray(source.reviews) ? source.reviews : [];
  return reviews.map(normalizeReviewEntry);
}

export async function fetchProductReviewSummary(productId: string) {
  if (!productId.trim() || !supportsReviewLookup(productId)) {
    return emptySummary;
  }
  const response = await fetchJson<RawReviewSummaryResponse>(`/api/products/${encodeURIComponent(productId)}/reviews/summary`);
  const summary = normalizeReviewSummary(response);
  summaryCache.set(productId, summary);
  return summary;
}

export async function fetchProductReviews(productId: string, size = 3) {
  if (!productId.trim() || !supportsReviewLookup(productId)) {
    return [];
  }
  const response = await fetchJson<RawProductReviewListResponse>(
    `/api/products/${encodeURIComponent(productId)}/reviews?sort=newest&page=0&size=${encodeURIComponent(String(size))}`
  );
  const reviews = normalizeReviewList(response);
  reviewListCache.set(`${productId}:${size}`, reviews);
  return reviews;
}

export function useProductReviewSummary(productId: string) {
  const [state, setState] = useState<ReviewState<ProductReviewSummary>>({
    data: summaryCache.get(productId) || emptySummary,
    isLoading: Boolean(productId) && !summaryCache.has(productId),
    error: null,
  });

  useEffect(() => {
    let active = true;
    if (!productId.trim() || !supportsReviewLookup(productId)) {
      setState({ data: emptySummary, isLoading: false, error: null });
      return () => {
        active = false;
      };
    }

    const cached = summaryCache.get(productId);
    if (cached) {
      setState({ data: cached, isLoading: false, error: null });
      return () => {
        active = false;
      };
    }

    setState((current) => ({ ...current, isLoading: true, error: null }));
    fetchProductReviewSummary(productId)
      .then((summary) => {
        if (!active) return;
        startTransition(() => {
          setState({ data: summary, isLoading: false, error: null });
        });
      })
      .catch((error) => {
        if (!active) return;
        startTransition(() => {
          setState({
            data: emptySummary,
            isLoading: false,
            error: error instanceof Error ? error.message : "Yorum özeti yüklenemedi.",
          });
        });
      });

    return () => {
      active = false;
    };
  }, [productId]);

  return state;
}

export function useProductReviews(productId: string, size = 3) {
  const cacheKey = `${productId}:${size}`;
  const [state, setState] = useState<ReviewState<ProductReviewEntry[]>>({
    data: reviewListCache.get(cacheKey) || [],
    isLoading: Boolean(productId) && !reviewListCache.has(cacheKey),
    error: null,
  });

  useEffect(() => {
    let active = true;
    if (!productId.trim() || !supportsReviewLookup(productId)) {
      setState({ data: [], isLoading: false, error: null });
      return () => {
        active = false;
      };
    }

    const cached = reviewListCache.get(cacheKey);
    if (cached) {
      setState({ data: cached, isLoading: false, error: null });
      return () => {
        active = false;
      };
    }

    setState((current) => ({ ...current, isLoading: true, error: null }));
    fetchProductReviews(productId, size)
      .then((reviews) => {
        if (!active) return;
        startTransition(() => {
          setState({ data: reviews, isLoading: false, error: null });
        });
      })
      .catch((error) => {
        if (!active) return;
        startTransition(() => {
          setState({
            data: [],
            isLoading: false,
            error: error instanceof Error ? error.message : "Yorumlar yüklenemedi.",
          });
        });
      });

    return () => {
      active = false;
    };
  }, [cacheKey, productId, size]);

  return state;
}

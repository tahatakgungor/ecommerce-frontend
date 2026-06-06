import { startTransition, useEffect, useState } from "react";

import { fetchJson } from "@/lib/http-client";
import { readJsonValue, writeJsonValue } from "@/lib/json-store";
import { formatOrderDate } from "@/modules/orders/helpers";

export type ProductReviewSummary = {
  averageRating: number;
  totalReviews: number;
};

export type ProductReviewSummaryMap = Record<string, ProductReviewSummary>;

type ReviewSummaryCacheRecord = {
  averageRating: number;
  totalReviews: number;
  cachedAt: number;
};

type BatchReviewSummaryResponse = {
  data?: Record<string, RawReviewSummaryResponse>;
  result?: Record<string, RawReviewSummaryResponse>;
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
const REVIEW_SUMMARY_CACHE_KEY = "product_review_summary_cache_v1";
const REVIEW_SUMMARY_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const REVIEW_LIST_CACHE_TTL_MS = 10 * 60 * 1000;
const reviewSummaryRequestCache = new Map<string, Promise<ProductReviewSummary>>();
const reviewListRequestCache = new Map<string, Promise<ProductReviewEntry[]>>();
const reviewListExpiresAt = new Map<string, number>();

function normalizeReviewErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message.trim() : "";
  if (!message) {
    return fallback;
  }

  if (/timeout|canceled|cancelled|aborted/i.test(message)) {
    return null;
  }

  return fallback;
}

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

function buildSummaryMap(productIds: string[]) {
  return productIds.reduce<ProductReviewSummaryMap>((accumulator, productId) => {
    const cached = summaryCache.get(productId);
    if (cached) {
      accumulator[productId] = cached;
    }
    return accumulator;
  }, {});
}

async function readPersistedSummaryCache() {
  return readJsonValue<Record<string, ReviewSummaryCacheRecord>>(REVIEW_SUMMARY_CACHE_KEY, {});
}

async function hydrateSummaryCache(productIds: string[]) {
  const persisted = await readPersistedSummaryCache();
  const now = Date.now();
  const hydrated: ProductReviewSummaryMap = {};

  productIds.forEach((productId) => {
    const record = persisted[productId];
    if (!record || now - Number(record.cachedAt || 0) > REVIEW_SUMMARY_CACHE_TTL_MS) {
      return;
    }

    const summary = {
      averageRating: readNumber(record.averageRating, 0),
      totalReviews: Math.max(0, readNumber(record.totalReviews, 0)),
    };
    summaryCache.set(productId, summary);
    hydrated[productId] = summary;
  });

  return hydrated;
}

async function persistSummaryEntries(summaries: ProductReviewSummaryMap) {
  if (!Object.keys(summaries).length) {
    return;
  }

  const persisted = await readPersistedSummaryCache();
  const now = Date.now();
  const nextCache = { ...persisted };

  Object.entries(summaries).forEach(([productId, summary]) => {
    nextCache[productId] = {
      averageRating: summary.averageRating,
      totalReviews: summary.totalReviews,
      cachedAt: now,
    };
  });

  await writeJsonValue(REVIEW_SUMMARY_CACHE_KEY, nextCache);
}

async function fetchSummariesWithConcurrency(productIds: string[], concurrency = 4) {
  const summaries: ProductReviewSummaryMap = {};
  const queue = [...productIds];

  async function worker() {
    while (queue.length) {
      const productId = queue.shift();
      if (!productId) {
        return;
      }

      try {
        const summary = await fetchProductReviewSummary(productId);
        summaries[productId] = summary;
      } catch {
        summaries[productId] = emptySummary;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, () => worker()));
  await persistSummaryEntries(summaries);
  return summaries;
}

async function fetchProductReviewSummariesBatch(productIds: string[]) {
  const searchableIds = productIds.filter((productId) => supportsReviewLookup(productId));
  if (!searchableIds.length) {
    return {};
  }

  const searchParams = new URLSearchParams();
  searchableIds.forEach((productId) => searchParams.append("productIds", productId));
  const response = await fetchJson<BatchReviewSummaryResponse>(`/api/products/reviews/batch-summary?${searchParams.toString()}`, {
    timeoutMs: 5000,
  });
  const payload = response?.data || response?.result || {};
  const summaries = searchableIds.reduce<ProductReviewSummaryMap>((accumulator, productId) => {
    const summary = normalizeReviewSummary(payload[productId]);
    summaryCache.set(productId, summary);
    accumulator[productId] = summary;
    return accumulator;
  }, {});
  await persistSummaryEntries(summaries);
  return summaries;
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
  const inflightRequest = reviewSummaryRequestCache.get(productId);
  if (inflightRequest) {
    return inflightRequest;
  }
  const request = fetchJson<RawReviewSummaryResponse>(`/api/products/${encodeURIComponent(productId)}/reviews/summary`)
    .then((response) => {
      const summary = normalizeReviewSummary(response);
      summaryCache.set(productId, summary);
      void persistSummaryEntries({ [productId]: summary });
      return summary;
    })
    .finally(() => {
      reviewSummaryRequestCache.delete(productId);
    });
  reviewSummaryRequestCache.set(productId, request);
  return request;
}

export async function fetchProductReviews(productId: string, size = 3) {
  if (!productId.trim() || !supportsReviewLookup(productId)) {
    return [];
  }
  const cacheKey = `${productId}:${size}`;
  const cachedReviews = reviewListCache.get(cacheKey);
  const expiresAt = reviewListExpiresAt.get(cacheKey) || 0;
  if (cachedReviews && expiresAt > Date.now()) {
    return cachedReviews;
  }

  const inflightRequest = reviewListRequestCache.get(cacheKey);
  if (inflightRequest) {
    return inflightRequest;
  }

  const request = fetchJson<RawProductReviewListResponse>(
    `/api/products/${encodeURIComponent(productId)}/reviews?sort=newest&page=0&size=${encodeURIComponent(String(size))}`,
    {
      timeoutMs: 2500,
    }
  )
    .then((response) => {
      const reviews = normalizeReviewList(response);
      reviewListCache.set(cacheKey, reviews);
      reviewListExpiresAt.set(cacheKey, Date.now() + REVIEW_LIST_CACHE_TTL_MS);
      return reviews;
    })
    .finally(() => {
      reviewListRequestCache.delete(cacheKey);
    });

  reviewListRequestCache.set(cacheKey, request);
  return request;
}

export function useProductReviewSummaries(productIds: string[]) {
  const normalizedIds = productIds
    .map((productId) => String(productId || "").trim())
    .filter(Boolean);
  const cacheKey = normalizedIds.join("|");
  const [state, setState] = useState<ReviewState<ProductReviewSummaryMap>>({
    data: buildSummaryMap(normalizedIds),
    isLoading: normalizedIds.some((productId) => supportsReviewLookup(productId) && !summaryCache.has(productId)),
    error: null,
  });

  useEffect(() => {
    let active = true;
    const uniqueIds = Array.from(new Set(normalizedIds));
    let cachedMap = buildSummaryMap(uniqueIds);

    setState({
      data: cachedMap,
      isLoading: uniqueIds.some((productId) => supportsReviewLookup(productId) && !summaryCache.has(productId)),
      error: null,
    });

    hydrateSummaryCache(uniqueIds)
      .then((persistedMap) => {
        if (!active || !Object.keys(persistedMap).length) return;
        cachedMap = { ...cachedMap, ...persistedMap };
        startTransition(() => {
          setState((current) => ({
            data: { ...current.data, ...persistedMap },
            isLoading: current.isLoading,
            error: current.error,
          }));
        });
      })
      .then(async () => {
        const missingIds = uniqueIds.filter((productId) => supportsReviewLookup(productId) && !summaryCache.has(productId));
        if (!missingIds.length) {
          if (!active) return;
          startTransition(() => {
            setState({
              data: buildSummaryMap(uniqueIds),
              isLoading: false,
              error: null,
            });
          });
          return;
        }

        try {
          const incoming = await fetchProductReviewSummariesBatch(missingIds);
          if (!active) return;
          startTransition(() => {
            setState({
              data: {
                ...cachedMap,
                ...incoming,
              },
              isLoading: false,
              error: null,
            });
          });
        } catch {
          const fallback = await fetchSummariesWithConcurrency(missingIds);
          if (!active) return;
          startTransition(() => {
            setState({
              data: {
                ...cachedMap,
                ...fallback,
              },
              isLoading: false,
              error: null,
            });
          });
        }
      })
      .catch((error) => {
        if (!active) return;
        startTransition(() => {
          setState({
            data: cachedMap,
            isLoading: false,
            error: normalizeReviewErrorMessage(error, "Yorum özetleri şu an getirilemiyor."),
          });
        });
      });

    return () => {
      active = false;
    };
  }, [cacheKey]);

  return state;
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
            error: normalizeReviewErrorMessage(error, "Yorum özeti şu an yüklenemedi."),
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
            error: normalizeReviewErrorMessage(error, "Yorumlar şu an getirilemiyor."),
          });
        });
      });

    return () => {
      active = false;
    };
  }, [cacheKey, productId, size]);

  return state;
}

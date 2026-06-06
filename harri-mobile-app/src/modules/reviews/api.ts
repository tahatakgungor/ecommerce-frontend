import { fetchJson } from "@/lib/http-client";
import { normalizeReviewOverview } from "@/modules/reviews/helpers";
import type { RawReviewOverview, ReviewMutationPayload } from "@/modules/reviews/types";

type ReviewMutationEnvelope = {
  success?: boolean;
  message?: string;
  data?: {
    reviewId?: string;
  };
  reviewId?: string;
};

export async function fetchMyReviewOverview() {
  const response = await fetchJson<RawReviewOverview>("/api/user/reviews/overview", {
    auth: true,
  });

  return normalizeReviewOverview(response);
}

export async function createProductReview(productId: string, payload: ReviewMutationPayload) {
  const response = await fetchJson<ReviewMutationEnvelope>(`/api/products/${encodeURIComponent(productId)}/reviews`, {
    method: "POST",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rating: payload.rating,
      commentTitle: payload.commentTitle.trim() || null,
      commentBody: payload.commentBody.trim() || null,
      mediaUrls: [],
      orderId: payload.orderId || null,
    }),
  });

  return {
    reviewId: response?.data?.reviewId || response?.reviewId || "",
    message: response?.message || "Degerlendirme gonderildi.",
  };
}

export async function updateProductReview(productId: string, reviewId: string, payload: ReviewMutationPayload) {
  const response = await fetchJson<ReviewMutationEnvelope>(
    `/api/products/${encodeURIComponent(productId)}/reviews/${encodeURIComponent(reviewId)}`,
    {
      method: "PUT",
      auth: true,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: payload.rating,
        commentTitle: payload.commentTitle.trim() || null,
        commentBody: payload.commentBody.trim() || null,
        mediaUrls: [],
        orderId: payload.orderId || null,
      }),
    }
  );

  return response?.message || "Degerlendirme guncellendi.";
}

export async function deleteOwnProductReview(productId: string, reviewId: string) {
  const response = await fetchJson<ReviewMutationEnvelope>(
    `/api/products/${encodeURIComponent(productId)}/reviews/${encodeURIComponent(reviewId)}/me`,
    {
      method: "DELETE",
      auth: true,
    }
  );

  return response?.message || "Degerlendirme silindi.";
}

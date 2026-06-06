import { Platform } from "react-native";

import { fetchJson } from "@/lib/http-client";
import { buildReviewMediaFileName, type UploadableReviewAsset } from "@/modules/reviews/media";
import { normalizeReviewOverview } from "@/modules/reviews/helpers";
import type { RawReviewOverview, ReviewMutationPayload } from "@/modules/reviews/types";

type ReviewMutationEnvelope = {
  success?: boolean;
  message?: string;
  data?: {
    reviewId?: string;
    url?: string;
  };
  reviewId?: string;
  url?: string;
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
      mediaUrls: payload.mediaUrls,
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
        mediaUrls: payload.mediaUrls,
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

export async function uploadReviewMediaAsset(productId: string, asset: UploadableReviewAsset, index: number) {
  const formData = new FormData();
  const fileName = buildReviewMediaFileName(asset, index);
  const mimeType = asset.mimeType || "image/jpeg";

  if (Platform.OS === "web" && asset.file) {
    formData.append("file", asset.file);
  } else {
    formData.append("file", {
      uri: asset.uri,
      name: fileName,
      type: mimeType,
    } as never);
  }

  const response = await fetchJson<ReviewMutationEnvelope>(`/api/products/${encodeURIComponent(productId)}/reviews/media-upload`, {
    method: "POST",
    auth: true,
    body: formData,
  });

  const uploadedUrl = response?.data?.url || response?.url || "";
  if (!uploadedUrl) {
    throw new Error("Review media url missing");
  }

  return uploadedUrl;
}

export async function uploadReviewMediaBatch(productId: string, assets: UploadableReviewAsset[]) {
  const uploadedUrls: string[] = [];
  for (const [index, asset] of assets.entries()) {
    const uploadedUrl = await uploadReviewMediaAsset(productId, asset, index);
    uploadedUrls.push(uploadedUrl);
  }

  return uploadedUrls;
}

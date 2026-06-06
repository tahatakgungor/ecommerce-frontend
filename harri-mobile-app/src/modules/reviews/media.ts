import type { ImagePickerAsset } from "expo-image-picker";

export const MAX_REVIEW_MEDIA = 5;
export const MAX_REVIEW_MEDIA_BYTES = 8 * 1024 * 1024;

export type UploadableReviewAsset = Pick<ImagePickerAsset, "uri" | "fileName" | "fileSize" | "mimeType"> & {
  file?: File;
};

export function getRemainingReviewMediaSlots(mediaUrls: string[]) {
  return Math.max(0, MAX_REVIEW_MEDIA - mediaUrls.length);
}

export function validateReviewMediaSelection(
  currentCount: number,
  assets: UploadableReviewAsset[]
): { ok: true; assets: UploadableReviewAsset[] } | { ok: false; message: string } {
  if (!Array.isArray(assets) || assets.length === 0) {
    return {
      ok: false,
      message: "Yuklenecek gorsel secilmedi.",
    };
  }

  if (currentCount >= MAX_REVIEW_MEDIA) {
    return {
      ok: false,
      message: `En fazla ${MAX_REVIEW_MEDIA} gorsel ekleyebilirsiniz.`,
    };
  }

  if (currentCount + assets.length > MAX_REVIEW_MEDIA) {
    return {
      ok: false,
      message: `Bu secimle limit asiliyor. En fazla ${MAX_REVIEW_MEDIA} gorsel eklenebilir.`,
    };
  }

  for (const asset of assets) {
    const fileSize = typeof asset.fileSize === "number" ? asset.fileSize : 0;
    if (fileSize > MAX_REVIEW_MEDIA_BYTES) {
      return {
        ok: false,
        message: "Her bir gorsel en fazla 8 MB olabilir.",
      };
    }
  }

  return {
    ok: true,
    assets,
  };
}

export function buildReviewMediaFileName(asset: UploadableReviewAsset, index: number) {
  const explicit = typeof asset.fileName === "string" ? asset.fileName.trim() : "";
  if (explicit) {
    return explicit;
  }

  const extension = asset.mimeType?.includes("png")
    ? "png"
    : asset.mimeType?.includes("webp")
    ? "webp"
    : "jpg";

  return `review-media-${Date.now()}-${index}.${extension}`;
}

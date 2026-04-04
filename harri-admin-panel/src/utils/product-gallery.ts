import { normalizeMediaUrl } from "./media-url";

export const mergeGalleryImages = (
  mainImage?: string | null,
  relatedImages?: string[] | null
): string[] => {
  const all = [mainImage || "", ...(relatedImages || [])]
    .map((item) => normalizeMediaUrl(item || ""))
    .filter((item): item is string => Boolean(item));

  return Array.from(new Set(all));
};

export const resolvePrimaryProductImage = (
  relatedImages?: string[] | null,
  fallbackImage?: string | null
): string => {
  const merged = mergeGalleryImages(fallbackImage, relatedImages);
  return merged[0] || "";
};

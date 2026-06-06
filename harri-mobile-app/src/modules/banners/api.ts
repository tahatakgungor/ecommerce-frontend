import { fetchJson } from "@/lib/http-client";
import { normalizeCatalogMediaUrl } from "@/modules/catalog/media-url";
import type { HeroBanner, RawHeroBanner } from "@/modules/banners/types";

type HeroBannerResponse = {
  banners?: RawHeroBanner[];
};

const HERO_BANNER_CACHE_TTL_MS = 5 * 60 * 1000;

let heroBannerCache: { value: HeroBanner[]; expiresAt: number } | null = null;
let heroBannerRequest: Promise<HeroBanner[]> | null = null;

function normalizeHeroBanner(rawBanner: RawHeroBanner, index: number): HeroBanner | null {
  const title = String(rawBanner?.title || "").trim();
  const subtitle = String(rawBanner?.subtitle || "").trim();
  const ctaLabel = String(rawBanner?.ctaLabel || "").trim();
  const ctaLink = String(rawBanner?.ctaLink || "").trim();
  const imageUrl = normalizeCatalogMediaUrl(rawBanner?.imageUrl || null);

  if (!title && !subtitle && !imageUrl) {
    return null;
  }

  return {
    id: String(rawBanner?._id || rawBanner?.id || `hero-banner-${index}`),
    title,
    subtitle,
    ctaLabel,
    ctaLink,
    imageUrl,
    imageAlt: String(rawBanner?.imageAlt || rawBanner?.title || "Banner").trim(),
    openInNewTab: Boolean(rawBanner?.openInNewTab),
  };
}

export async function fetchHeroBanners(options?: { force?: boolean }) {
  const now = Date.now();
  if (!options?.force && heroBannerCache && heroBannerCache.expiresAt > now) {
    return heroBannerCache.value;
  }

  if (!options?.force && heroBannerRequest) {
    return heroBannerRequest;
  }

  heroBannerRequest = fetchJson<HeroBannerResponse>("/api/banners/show", { timeoutMs: 4500 })
    .then((response) => {
      const banners = Array.isArray(response?.banners) ? response.banners : [];
      const normalized = banners
        .map((banner, index) => normalizeHeroBanner(banner, index))
        .filter((banner): banner is HeroBanner => Boolean(banner));
      heroBannerCache = {
        value: normalized,
        expiresAt: Date.now() + HERO_BANNER_CACHE_TTL_MS,
      };
      return normalized;
    })
    .finally(() => {
      heroBannerRequest = null;
    });

  return heroBannerRequest;
}

import { fetchJson } from "@/lib/http-client";
import type { SiteSettings } from "@/modules/site-settings/types";

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  freeShippingThreshold: 400,
  defaultShippingFee: 49.9,
  announcementActive: false,
  announcementTextTr: "",
  announcementTextEn: "",
  announcementLink: "",
  announcementSpeed: 40,
};
const SITE_SETTINGS_CACHE_TTL_MS = 5 * 60 * 1000;

let siteSettingsCache: { value: SiteSettings; expiresAt: number } | null = null;
let siteSettingsRequest: Promise<SiteSettings> | null = null;

function normalizeSiteSettingsPayload(response: Partial<SiteSettings> | { data?: Partial<SiteSettings> }) {
  const normalizedPayload: Partial<SiteSettings> =
    response && typeof response === "object" && "data" in response && response.data && typeof response.data === "object"
      ? response.data
      : (response as Partial<SiteSettings>);

  return {
    freeShippingThreshold:
      typeof normalizedPayload.freeShippingThreshold === "number" && normalizedPayload.freeShippingThreshold > 0
        ? normalizedPayload.freeShippingThreshold
        : DEFAULT_SITE_SETTINGS.freeShippingThreshold,
    defaultShippingFee:
      typeof normalizedPayload.defaultShippingFee === "number" && normalizedPayload.defaultShippingFee >= 0
        ? normalizedPayload.defaultShippingFee
        : DEFAULT_SITE_SETTINGS.defaultShippingFee,
    announcementActive: Boolean(normalizedPayload.announcementActive),
    announcementTextTr:
      typeof normalizedPayload.announcementTextTr === "string"
        ? normalizedPayload.announcementTextTr.trim()
        : DEFAULT_SITE_SETTINGS.announcementTextTr,
    announcementTextEn:
      typeof normalizedPayload.announcementTextEn === "string"
        ? normalizedPayload.announcementTextEn.trim()
        : DEFAULT_SITE_SETTINGS.announcementTextEn,
    announcementLink:
      typeof normalizedPayload.announcementLink === "string"
        ? normalizedPayload.announcementLink.trim()
        : DEFAULT_SITE_SETTINGS.announcementLink,
    announcementSpeed:
      typeof normalizedPayload.announcementSpeed === "number" && normalizedPayload.announcementSpeed > 0
        ? normalizedPayload.announcementSpeed
        : DEFAULT_SITE_SETTINGS.announcementSpeed,
  } satisfies SiteSettings;
}

export async function fetchSiteSettings(options?: { force?: boolean }) {
  const now = Date.now();
  if (!options?.force && siteSettingsCache && siteSettingsCache.expiresAt > now) {
    return siteSettingsCache.value;
  }

  if (!options?.force && siteSettingsRequest) {
    return siteSettingsRequest;
  }

  siteSettingsRequest = fetchJson<Partial<SiteSettings> | { data?: Partial<SiteSettings> }>("/api/site-settings")
    .then((response) => {
      const normalized = normalizeSiteSettingsPayload(response);
      siteSettingsCache = {
        value: normalized,
        expiresAt: Date.now() + SITE_SETTINGS_CACHE_TTL_MS,
      };
      return normalized;
    })
    .finally(() => {
      siteSettingsRequest = null;
    });

  return siteSettingsRequest;
}

export function getDefaultSiteSettings() {
  return { ...DEFAULT_SITE_SETTINGS };
}

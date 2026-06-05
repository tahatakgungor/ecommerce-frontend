import { fetchJson } from "@/lib/http-client";
import type { SiteSettings } from "@/modules/site-settings/types";

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  freeShippingThreshold: 400,
  defaultShippingFee: 49.9,
};

export async function fetchSiteSettings() {
  const response = await fetchJson<Partial<SiteSettings> | { data?: Partial<SiteSettings> }>("/api/site-settings");
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
  } satisfies SiteSettings;
}

export function getDefaultSiteSettings() {
  return { ...DEFAULT_SITE_SETTINGS };
}

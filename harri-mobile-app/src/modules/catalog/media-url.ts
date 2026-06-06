import { readRawApiBaseUrl } from "@/config/runtime";

function resolveBaseUrl() {
  return readRawApiBaseUrl();
}

export function normalizeCatalogMediaUrl(url: string | null | undefined) {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;

  const baseUrl = resolveBaseUrl();

  if (trimmed.startsWith("/")) {
    return baseUrl ? `${baseUrl}${trimmed}` : trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    if (host.endsWith(".railway.app")) {
      return null;
    }

    if ((host === "localhost" || host === "127.0.0.1") && baseUrl) {
      return `${baseUrl}${parsed.pathname}${parsed.search || ""}${parsed.hash || ""}`;
    }

    return parsed.toString();
  } catch {
    return baseUrl ? `${baseUrl}/${trimmed.replace(/^\/+/, "")}` : trimmed;
  }
}

export function normalizeCatalogGallery(urls: string[] | null | undefined) {
  if (!Array.isArray(urls)) return [];
  return urls.map((item) => normalizeCatalogMediaUrl(item)).filter((item): item is string => Boolean(item));
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function isLocalAddress(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "10.0.2.2" ||
    hostname.endsWith(".local")
  );
}

export function readRawApiBaseUrl() {
  return trimTrailingSlash(process.env.EXPO_PUBLIC_API_BASE_URL || "");
}

export const runtimeConfig = {
  get apiBaseUrl() {
    return readRawApiBaseUrl();
  },
};

export function hasApiBaseUrl() {
  return runtimeConfig.apiBaseUrl.length > 0;
}

export function getValidatedApiBaseUrl() {
  if (!runtimeConfig.apiBaseUrl) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL missing");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(runtimeConfig.apiBaseUrl);
  } catch {
    throw new Error("EXPO_PUBLIC_API_BASE_URL invalid");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("API base URL must use http or https");
  }

  if (parsedUrl.protocol !== "https:" && !isLocalAddress(parsedUrl.hostname)) {
    throw new Error("Production API base URL must use https");
  }

  return trimTrailingSlash(parsedUrl.toString());
}

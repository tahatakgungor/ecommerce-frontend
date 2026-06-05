function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const runtimeConfig = {
  apiBaseUrl: trimTrailingSlash(process.env.EXPO_PUBLIC_API_BASE_URL || ""),
};

export function hasApiBaseUrl() {
  return runtimeConfig.apiBaseUrl.length > 0;
}

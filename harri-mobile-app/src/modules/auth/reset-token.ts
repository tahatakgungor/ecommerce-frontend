export function resolveResetPasswordToken(
  params: Partial<Record<"token" | "resetToken", string | string[] | undefined>>
) {
  const queryToken = readFirstValue(params.token);
  if (queryToken) {
    return queryToken;
  }

  const fallbackToken = readFirstValue(params.resetToken);
  if (fallbackToken) {
    return fallbackToken;
  }

  if (typeof window === "undefined") {
    return "";
  }

  const currentUrl = new URL(window.location.href);
  const urlSearchToken = readFirstValue(currentUrl.searchParams.get("token") || currentUrl.searchParams.get("resetToken") || "");
  if (urlSearchToken) {
    return urlSearchToken;
  }

  const hashValue = currentUrl.hash.startsWith("#") ? currentUrl.hash.slice(1) : currentUrl.hash;
  if (!hashValue) {
    return "";
  }

  const hashParams = new URLSearchParams(hashValue);
  return readFirstValue(hashParams.get("token") || hashParams.get("resetToken") || "");
}

function readFirstValue(value: string | string[] | undefined | null) {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0].trim() : "";
  }

  return typeof value === "string" ? value.trim() : "";
}

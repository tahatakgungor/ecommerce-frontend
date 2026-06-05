function readAllowedReturnUrlPrefixes() {
  const rawValue =
    process.env.MOBILE_PAYMENT_RETURN_URL_PREFIXES ||
    process.env.NEXT_PUBLIC_MOBILE_PAYMENT_RETURN_URL_PREFIXES ||
    "serravitmobile://,exp://,exp+";

  return rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function resolveMobilePaymentReturnUrl(rawValue) {
  const safeValue = typeof rawValue === "string" ? rawValue.trim() : "";
  if (!safeValue) {
    return null;
  }

  const allowedPrefixes = readAllowedReturnUrlPrefixes();
  return allowedPrefixes.some((prefix) => safeValue.startsWith(prefix)) ? safeValue : null;
}

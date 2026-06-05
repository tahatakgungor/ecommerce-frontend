import type { PendingPaymentSession } from "@/modules/checkout/types";

export const PENDING_PAYMENT_TTL_MS = 30 * 60 * 1000;

function readTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function createCheckoutSessionId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `chk_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export function buildMobilePaymentReturnUrl(baseUrl: string, checkoutSessionId: string) {
  const safeBaseUrl = readTrimmedString(baseUrl);
  const safeCheckoutSessionId = readTrimmedString(checkoutSessionId);

  if (!safeBaseUrl) {
    throw new Error("Mobile return URL missing");
  }

  if (!safeCheckoutSessionId) {
    throw new Error("Checkout session id missing");
  }

  try {
    const parsedUrl = new URL(safeBaseUrl);
    parsedUrl.searchParams.set("checkoutSessionId", safeCheckoutSessionId);
    return parsedUrl.toString();
  } catch {
    const separator = safeBaseUrl.includes("?") ? "&" : "?";
    return `${safeBaseUrl}${separator}checkoutSessionId=${encodeURIComponent(safeCheckoutSessionId)}`;
  }
}

export function isPendingPaymentSessionExpired(
  pendingPayment: Pick<PendingPaymentSession, "expiresAt" | "createdAt"> | null | undefined,
  now = Date.now()
) {
  if (!pendingPayment) {
    return true;
  }

  const expiresAtMs = Date.parse(readTrimmedString(pendingPayment.expiresAt));
  if (Number.isFinite(expiresAtMs)) {
    return expiresAtMs <= now;
  }

  const createdAtMs = Date.parse(readTrimmedString(pendingPayment.createdAt));
  if (!Number.isFinite(createdAtMs)) {
    return true;
  }

  return createdAtMs + PENDING_PAYMENT_TTL_MS <= now;
}

export function validatePendingPaymentSession(
  pendingPayment: PendingPaymentSession | null,
  checkoutSessionId: string | undefined,
  now = Date.now()
) {
  if (!pendingPayment) {
    return "Bekleyen odeme oturumu bulunamadi. Checkout'u yeniden baslatin.";
  }

  if (isPendingPaymentSessionExpired(pendingPayment, now)) {
    return "Bekleyen odeme oturumu zaman asimina ugradi. Checkout'u yeniden baslatin.";
  }

  const expectedSessionId = readTrimmedString(pendingPayment.checkoutSessionId);
  const actualSessionId = readTrimmedString(checkoutSessionId);

  if (expectedSessionId && expectedSessionId !== actualSessionId) {
    return "Odeme donusu aktif checkout oturumuyla eslesmiyor. Checkout'u yeniden baslatin.";
  }

  return null;
}

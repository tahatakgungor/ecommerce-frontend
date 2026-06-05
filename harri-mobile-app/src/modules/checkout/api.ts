import { fetchJson } from "@/lib/http-client";
import type {
  ConfirmPaymentPayload,
  ConfirmPaymentResult,
  CheckoutInitializePayload,
  InitializePaymentResponse,
} from "@/modules/checkout/types";

function ensureNonEmptyString(value: unknown, message: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(message);
  }

  return value.trim();
}

export async function initializeCheckoutPayment(payload: CheckoutInitializePayload) {
  const response = await fetchJson<InitializePaymentResponse>("/api/order/initialize-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return {
    checkoutFormContent: ensureNonEmptyString(response?.checkoutFormContent, "Checkout form missing"),
    conversationId: ensureNonEmptyString(response?.conversationId, "Conversation id missing"),
    confirmationToken: ensureNonEmptyString(response?.confirmationToken, "Confirmation token missing"),
    token: typeof response?.token === "string" ? response.token.trim() : "",
  };
}

export async function confirmCheckoutPayment(payload: ConfirmPaymentPayload) {
  return fetchJson<ConfirmPaymentResult>("/api/order/confirm-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

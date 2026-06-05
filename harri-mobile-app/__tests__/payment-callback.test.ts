import {
  parsePaymentCallbackUrl,
  resolvePaymentConfirmationPayload,
  shouldDelegatePaymentUrl,
} from "../src/modules/checkout/payment-callback";
import type { PendingPaymentSession } from "../src/modules/checkout/types";

const pendingPayment: PendingPaymentSession = {
  conversationId: " conv-123 ",
  confirmationToken: " confirm-123 ",
  customerEmail: "customer@example.com",
  createdAt: "2026-06-05T12:00:00.000Z",
  subtotal: 400,
  totalAmount: 449.9,
  itemCount: 3,
};

describe("payment callback helpers", () => {
  it("parses token and status from query string", () => {
    expect(parsePaymentCallbackUrl("serravitmobile://payment-result?token=abc123&status=success")).toEqual({
      token: "abc123",
      status: "success",
      error: undefined,
      rawUrl: "serravitmobile://payment-result?token=abc123&status=success",
    });
  });

  it("parses token from web hash redirects", () => {
    expect(parsePaymentCallbackUrl("https://serravit.com/order/payment-result#token=hash-token")).toEqual({
      token: "hash-token",
      status: undefined,
      error: undefined,
      rawUrl: "https://serravit.com/order/payment-result#token=hash-token",
    });
  });

  it("resolves confirmation payload from pending session", () => {
    expect(resolvePaymentConfirmationPayload(" token-1 ", pendingPayment)).toEqual({
      token: "token-1",
      conversationId: "conv-123",
      confirmationToken: "confirm-123",
    });
  });

  it("detects app deep links that should exit the webview", () => {
    expect(shouldDelegatePaymentUrl("serravitmobile://payment-result?token=abc")).toBe(true);
    expect(shouldDelegatePaymentUrl("exp://127.0.0.1:8081/--/payment-result?token=abc")).toBe(true);
    expect(shouldDelegatePaymentUrl("https://serravit.com/order/payment-result#token=abc")).toBe(false);
  });
});

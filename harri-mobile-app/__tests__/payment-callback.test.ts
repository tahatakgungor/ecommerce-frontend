import {
  buildPaymentResultUrl,
  parsePaymentCallbackUrl,
  resolvePaymentConfirmationPayload,
  shouldDelegatePaymentUrl,
} from "../src/modules/checkout/payment-callback";
import { buildMobilePaymentReturnUrl, validatePendingPaymentSession } from "../src/modules/checkout/session-guard";
import type { PendingPaymentSession } from "../src/modules/checkout/types";

const pendingPayment: PendingPaymentSession = {
  checkoutSessionId: "session-123",
  conversationId: " conv-123 ",
  confirmationToken: " confirm-123 ",
  customerEmail: "customer@example.com",
  createdAt: "2026-06-05T12:00:00.000Z",
  expiresAt: "2026-06-05T12:30:00.000Z",
  subtotal: 400,
  totalAmount: 449.9,
  itemCount: 3,
};

describe("payment callback helpers", () => {
  it("parses token and status from query string", () => {
    expect(parsePaymentCallbackUrl("serravitmobile://payment-result?checkoutSessionId=session-123&token=abc123&status=success")).toEqual({
      checkoutSessionId: "session-123",
      token: "abc123",
      status: "success",
      error: undefined,
      rawUrl: "serravitmobile://payment-result?checkoutSessionId=session-123&token=abc123&status=success",
    });
  });

  it("parses token from web hash redirects", () => {
    expect(parsePaymentCallbackUrl("https://serravit.com/order/payment-result#checkoutSessionId=session-123&token=hash-token")).toEqual({
      checkoutSessionId: "session-123",
      token: "hash-token",
      status: undefined,
      error: undefined,
      rawUrl: "https://serravit.com/order/payment-result#checkoutSessionId=session-123&token=hash-token",
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

  it("builds payment result deep link query params", () => {
    expect(
      buildPaymentResultUrl("serravitmobile://payment-result", {
        checkoutSessionId: "session-123",
        token: "fixture-token",
        status: "success",
      })
    ).toBe("serravitmobile://payment-result?checkoutSessionId=session-123&token=fixture-token&status=success");
  });

  it("builds mobile return url with checkout session id", () => {
    expect(buildMobilePaymentReturnUrl("serravitmobile://payment-result", "session-123")).toBe(
      "serravitmobile://payment-result?checkoutSessionId=session-123"
    );
    expect(buildMobilePaymentReturnUrl("exp://127.0.0.1:8081/--/payment-result?foo=bar", "session-123")).toContain(
      "checkoutSessionId=session-123"
    );
  });

  it("validates matching pending session", () => {
    expect(validatePendingPaymentSession(pendingPayment, "session-123", Date.parse("2026-06-05T12:15:00.000Z"))).toBeNull();
  });

  it("rejects mismatched session ids", () => {
    expect(validatePendingPaymentSession(pendingPayment, "session-999", Date.parse("2026-06-05T12:15:00.000Z"))).toBe(
      "Odeme donusu aktif checkout oturumuyla eslesmiyor. Checkout'u yeniden baslatin."
    );
  });

  it("rejects expired pending sessions", () => {
    expect(validatePendingPaymentSession(pendingPayment, "session-123", Date.parse("2026-06-05T12:31:00.000Z"))).toBe(
      "Bekleyen odeme oturumu zaman asimina ugradi. Checkout'u yeniden baslatin."
    );
  });
});

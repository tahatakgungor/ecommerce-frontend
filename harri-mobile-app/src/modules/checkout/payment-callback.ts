import type { ConfirmPaymentPayload, PaymentCallback, PendingPaymentSession } from "@/modules/checkout/types";

function readTrimmedValue(value: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function parsePaymentCallbackUrl(rawUrl: string): PaymentCallback {
  try {
    const parsedUrl = new URL(rawUrl);
    const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ""));
    const checkoutSessionId =
      readTrimmedValue(parsedUrl.searchParams.get("checkoutSessionId")) || readTrimmedValue(hashParams.get("checkoutSessionId"));
    const token = readTrimmedValue(parsedUrl.searchParams.get("token")) || readTrimmedValue(hashParams.get("token"));
    const status = readTrimmedValue(parsedUrl.searchParams.get("status")) || readTrimmedValue(hashParams.get("status"));
    const error = readTrimmedValue(parsedUrl.searchParams.get("error")) || readTrimmedValue(hashParams.get("error"));

    return {
      checkoutSessionId: checkoutSessionId || undefined,
      token: token || undefined,
      status: status || undefined,
      error: error || undefined,
      rawUrl,
    };
  } catch {
    return {
      error: "callback_url_invalid",
      rawUrl,
    };
  }
}

export function resolvePaymentConfirmationPayload(
  token: string,
  pendingPayment: PendingPaymentSession | null
): ConfirmPaymentPayload {
  const safeToken = token.trim();
  const safeConversationId = pendingPayment?.conversationId?.trim() || "";
  const safeConfirmationToken = pendingPayment?.confirmationToken?.trim() || "";

  return {
    token: safeToken,
    conversationId: safeConversationId || undefined,
    confirmationToken: safeConfirmationToken || undefined,
  };
}

export function shouldDelegatePaymentUrl(url: string) {
  return /^(serravitmobile|exp|exp\+)/i.test(url);
}

export function buildPaymentResultUrl(baseUrl: string, params: Record<string, string | undefined>) {
  const targetUrl = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      targetUrl.searchParams.set(key, value);
    }
  }
  return targetUrl.toString();
}

export function buildPaymentHtmlDocument(checkoutFormContent: string) {
  return `<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: #f4f7f3;
      }

      body {
        min-height: 100vh;
      }
    </style>
  </head>
  <body>
    ${checkoutFormContent}
  </body>
</html>`;
}

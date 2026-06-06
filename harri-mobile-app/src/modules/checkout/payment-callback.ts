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
        background: #ffffff;
        color: #17211b;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        min-height: 100%;
      }

      body {
        min-height: 100vh;
        overflow-x: hidden;
      }

      #iyzipay-checkout-form,
      #iyzipay-checkout-form * {
        box-sizing: border-box;
      }

      #iyzipay-checkout-form {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .iyzipay-checkout-form,
      .iyzipay-checkout-form * {
        max-width: 100% !important;
      }

      .iyzipay-sandbox-header {
        position: sticky !important;
        top: 0;
        z-index: 100;
      }
    </style>
    <script>
      (function () {
        function postMessageSafe(payload) {
          if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === "function") {
            window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          }
        }

        function notifyHeight() {
          var root = document.documentElement;
          var body = document.body;
          var height = Math.max(
            root ? root.scrollHeight : 0,
            body ? body.scrollHeight : 0,
            root ? root.offsetHeight : 0,
            body ? body.offsetHeight : 0
          );
          postMessageSafe({ type: "height", height: height });
        }

        window.addEventListener("load", function () {
          postMessageSafe({ type: "ready" });
          notifyHeight();
          setTimeout(notifyHeight, 300);
          setTimeout(notifyHeight, 1200);
        });

        document.addEventListener("DOMContentLoaded", function () {
          postMessageSafe({ type: "dom-ready" });
          notifyHeight();
        });

        if (typeof ResizeObserver !== "undefined") {
          var resizeObserver = new ResizeObserver(function () {
            notifyHeight();
          });
          window.addEventListener("load", function () {
            if (document.body) {
              resizeObserver.observe(document.body);
            }
          });
        }
      })();
    </script>
  </head>
  <body>
    <div id="iyzipay-checkout-form">
      ${checkoutFormContent}
    </div>
  </body>
</html>`;
}

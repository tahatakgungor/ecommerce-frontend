import { NextResponse } from "next/server";
import { resolveMobilePaymentReturnUrl } from "src/utils/mobile-payment-return-url";

function frameBreakRedirect(url) {
  const safeUrl = JSON.stringify(url.toString());
  return new NextResponse(
    `<html><body><script>(function(){try{if(window.top&&window.top!==window.self){window.top.location.replace(${safeUrl});}else{window.location.replace(${safeUrl});}}catch(e){window.location.href=${safeUrl};}})();</script></body></html>`,
    { headers: { "Content-Type": "text/html", "Cache-Control": "no-store, max-age=0" } }
  );
}

function appendParams(targetUrl, params, mode) {
  if (mode === "query") {
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        targetUrl.searchParams.set(key, value);
      }
    }
    return targetUrl;
  }

  const hashParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      hashParams.set(key, value);
    }
  }
  targetUrl.hash = hashParams.toString();
  return targetUrl;
}

function buildResultUrl(request, params) {
  const requestUrl = new URL(request.url);
  const mobileReturnUrl = resolveMobilePaymentReturnUrl(requestUrl.searchParams.get("returnUrl"));
  if (mobileReturnUrl) {
    return appendParams(new URL(mobileReturnUrl), params, "query");
  }

  const envUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
  const baseUrl = envUrl ? envUrl : `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("host") || "serravit.com"}`;
  const resultUrl = new URL("/order/payment-result", baseUrl);
  return appendParams(resultUrl, params, "hash");
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const token = formData.get("token") || "";
    const status = formData.get("status") || "";
    return frameBreakRedirect(buildResultUrl(request, { token, status }));
  } catch (error) {
    console.error("Payment callback error:", error);
    return frameBreakRedirect(buildResultUrl(request, { error: "callback_failed" }));
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || "";
    const status = searchParams.get("status") || "";
    return frameBreakRedirect(buildResultUrl(request, { token, status }));
  } catch {
    return frameBreakRedirect(buildResultUrl(request, { error: "callback_failed" }));
  }
}

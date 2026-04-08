import { NextResponse } from "next/server";

function frameBreakRedirect(url) {
  const safeUrl = JSON.stringify(url.toString());
  return new NextResponse(
    `<html><body><script>window.top.location.href=${safeUrl};</script></body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

function buildResultUrl(request, params) {
  const envUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
  const baseUrl = envUrl ? envUrl : `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("host") || "serravit.com"}`;
  const resultUrl = new URL("/order/payment-result", baseUrl);
  for (const [k, v] of Object.entries(params)) {
    if (v) resultUrl.searchParams.set(k, v);
  }
  return resultUrl;
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

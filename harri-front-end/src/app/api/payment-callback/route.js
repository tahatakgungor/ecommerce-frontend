import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const token = formData.get("token") || "";
    const status = formData.get("status") || "";

    const resultUrl = new URL("/order/payment-result", request.url);
    resultUrl.searchParams.set("token", token);
    resultUrl.searchParams.set("status", status);

    return NextResponse.redirect(resultUrl, 303);
  } catch {
    const fallbackUrl = new URL("/order/payment-result", request.url);
    fallbackUrl.searchParams.set("error", "callback_failed");
    return NextResponse.redirect(fallbackUrl, 303);
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || "";
    const status = searchParams.get("status") || "";

    const resultUrl = new URL("/order/payment-result", request.url);
    if (token) resultUrl.searchParams.set("token", token);
    if (status) resultUrl.searchParams.set("status", status);

    return NextResponse.redirect(resultUrl, 303);
  } catch {
    const fallbackUrl = new URL("/order/payment-result", request.url);
    fallbackUrl.searchParams.set("error", "callback_failed");
    return NextResponse.redirect(fallbackUrl, 303);
  }
}

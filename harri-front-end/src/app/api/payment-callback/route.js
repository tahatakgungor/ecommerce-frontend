import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const token = formData.get("token") || "";
    const status = formData.get("status") || "";

    const host = request.headers.get("host") || "serravit.com";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const baseUrl = `${proto}://${host}`;

    const resultUrl = new URL("/order/payment-result", baseUrl);
    resultUrl.searchParams.set("token", token);
    resultUrl.searchParams.set("status", status);

    // FRAME BREAKER: Instead of 302/303 redirect which gets stuck in iframe
    // We return a script that redirects the TOP window
    return new NextResponse(`
      <html>
        <body>
          <script>
            window.top.location.href = "${resultUrl.toString()}";
          </script>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" }
    });
  } catch (error) {
    console.error("Payment callback error:", error);
    
    const host = request.headers.get("host") || "serravit.com";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const baseUrl = `${proto}://${host}`;
    
    const fallbackUrl = new URL("/order/payment-result", baseUrl);
    fallbackUrl.searchParams.set("error", "callback_failed");
    
    return new NextResponse(`
      <html>
        <body>
          <script>
            window.top.location.href = "${fallbackUrl.toString()}";
          </script>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" }
    });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || "";
    const status = searchParams.get("status") || "";

    const host = request.headers.get("host") || "serravit.com";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const baseUrl = `${proto}://${host}`;

    const resultUrl = new URL("/order/payment-result", baseUrl);
    if (token) resultUrl.searchParams.set("token", token);
    if (status) resultUrl.searchParams.set("status", status);

    return new NextResponse(`
      <html>
        <body>
          <script>
            window.top.location.href = "${resultUrl.toString()}";
          </script>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" }
    });
  } catch {
    const host = request.headers.get("host") || "serravit.com";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const baseUrl = `${proto}://${host}`;

    const fallbackUrl = new URL("/order/payment-result", baseUrl);
    fallbackUrl.searchParams.set("error", "callback_failed");

    return new NextResponse(`
      <html>
        <body>
          <script>
            window.top.location.href = "${fallbackUrl.toString()}";
          </script>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html" }
    });
  }
}

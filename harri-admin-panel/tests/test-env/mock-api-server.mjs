import http from "node:http";
import path from "node:path";
import {
  FIXTURE_ROOT,
  TEST_ENV_API_PORT,
  TEST_ENV_FRONTEND_ORIGIN,
  readJson,
} from "./shared.mjs";

const PRODUCTS_FIXTURE_PATH = path.join(FIXTURE_ROOT, "products-all.json");
const REVIEWS_FIXTURE_PATH = path.join(FIXTURE_ROOT, "admin-reviews.json");
const ADMIN_ME_FIXTURE_PATH = path.join(FIXTURE_ROOT, "admin-me.json");

function setCorsHeaders(request, response) {
  const requestOrigin = request.headers.origin || TEST_ENV_FRONTEND_ORIGIN;
  response.setHeader("Access-Control-Allow-Origin", requestOrigin);
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-XSRF-TOKEN");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
}

async function loadState() {
  const productsPayload = await readJson(PRODUCTS_FIXTURE_PATH);
  const reviewsPayload = await readJson(REVIEWS_FIXTURE_PATH);
  const adminPayload = await readJson(ADMIN_ME_FIXTURE_PATH);

  return {
    products: Array.isArray(productsPayload?.data) ? productsPayload.data : [],
    reviews: Array.isArray(reviewsPayload?.data?.reviews) ? reviewsPayload.data.reviews : [],
    admin: adminPayload?.data || adminPayload,
  };
}

function createReviewResponse(reviews, status, page, size) {
  const filtered = reviews.filter((review) => review.status === status);
  const start = page * size;
  const sliced = filtered.slice(start, start + size);
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));

  return {
    success: true,
    data: {
      reviews: sliced,
      status,
      page,
      size,
      totalPages,
      totalElements: filtered.length,
    },
  };
}

async function startServer() {
  const state = await loadState();

  const server = http.createServer(async (request, response) => {
    setCorsHeaders(request, response);

    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    const requestUrl = new URL(request.url || "/", `http://localhost:${TEST_ENV_API_PORT}`);

    if (requestUrl.pathname === "/__health") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ ok: true, port: TEST_ENV_API_PORT }));
      return;
    }

    if (requestUrl.pathname === "/api/admin/me") {
      response.setHeader("Set-Cookie", "XSRF-TOKEN=admin-test-env-xsrf; Path=/");
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, data: state.admin }));
      return;
    }

    if (requestUrl.pathname === "/api/products/all") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, data: state.products }));
      return;
    }

    if (requestUrl.pathname.startsWith("/api/products/update/") && request.method === "PUT") {
      const productId = requestUrl.pathname.split("/").pop();
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
      const product = state.products.find((item) => String(item._id) === String(productId));
      if (product && body?.status) {
        product.status = String(body.status).toLowerCase();
      }
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true }));
      return;
    }

    if (requestUrl.pathname === "/api/admin/reviews" && request.method === "GET") {
      const status = requestUrl.searchParams.get("status") || "PENDING";
      const page = Number(requestUrl.searchParams.get("page") || 0);
      const size = Number(requestUrl.searchParams.get("size") || 20);

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(createReviewResponse(state.reviews, status, page, size)));
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/admin\/reviews\/[^/]+\/status$/) && request.method === "PATCH") {
      const reviewId = requestUrl.pathname.split("/")[4];
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
      const review = state.reviews.find((item) => item.reviewId === reviewId);
      if (review && body?.status) {
        review.status = body.status;
        review.updatedAt = new Date().toISOString();
      }
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, data: review }));
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/admin\/reviews\/[^/]+$/) && request.method === "DELETE") {
      const reviewId = requestUrl.pathname.split("/").pop();
      state.reviews = state.reviews.filter((item) => item.reviewId !== reviewId);
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, message: "Deleted" }));
      return;
    }

    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ success: false, message: "Fixture endpoint not found" }));
  });

  server.listen(TEST_ENV_API_PORT, () => {
    console.log(`admin mock API ready on ${TEST_ENV_API_PORT}`);
    console.log(`admin frontend origin allowed: ${TEST_ENV_FRONTEND_ORIGIN}`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

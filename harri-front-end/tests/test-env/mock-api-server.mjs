import http from "node:http";
import {
  FIXTURE_MANIFEST_PATH,
  ORDER_LOOKUP_FIXTURE_PATH,
  ORDER_VIEW_FIXTURE_PATH,
  PUBLIC_FIXTURES,
  TEST_ENV_API_PORT,
  TEST_ENV_FRONTEND_ORIGIN,
  fileExists,
  getFixturePath,
  readJson,
} from "./shared.mjs";

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", TEST_ENV_FRONTEND_ORIGIN);
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-XSRF-TOKEN");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
}

async function loadFixtureMap() {
  const fixtureMap = new Map();

  for (const fixture of PUBLIC_FIXTURES) {
    const fixturePath = getFixturePath(fixture.fileName);
    if (!(await fileExists(fixturePath))) {
      throw new Error(
        `Missing fixture file: ${fixture.fileName}. Run \`npm run test:env:sync\` first.`
      );
    }
    fixtureMap.set(fixture.endpoint, fixturePath);
  }

  return fixtureMap;
}

function createReviewSummary(product) {
  const totalReviews = product ? 1 : 0;
  const averageRating = product ? 5 : 0;
  return {
    averageRating,
    totalReviews,
    ratings: {
      5: totalReviews,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
    mediaCount: product?.image ? 1 : 0,
  };
}

async function startServer() {
  const fixtureMap = await loadFixtureMap();
  const orderLookupFixture = await readJson(ORDER_LOOKUP_FIXTURE_PATH);
  const orderViewFixture = await readJson(ORDER_VIEW_FIXTURE_PATH);
  const productsFixture = await readJson(getFixturePath("products-show.json"));
  const products = Array.isArray(productsFixture?.products) ? productsFixture.products : [];

  const server = http.createServer(async (request, response) => {
    setCorsHeaders(response);

    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    if (request.url === "/__health") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ ok: true, port: TEST_ENV_API_PORT }));
      return;
    }

    if (request.url === "/__manifest") {
      const manifest = await readJson(FIXTURE_MANIFEST_PATH);
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(manifest));
      return;
    }

    const requestUrl = new URL(request.url || "/", `http://localhost:${TEST_ENV_API_PORT}`);

    if (requestUrl.pathname === "/api/order/lookup") {
      const invoice = requestUrl.searchParams.get("invoice") || "";
      const email = requestUrl.searchParams.get("email") || "";
      const expectedInvoice = String(orderLookupFixture?.data?.invoice || "");
      const expectedEmail = String(orderLookupFixture?.data?.email || "");

      if (invoice !== expectedInvoice || email.toLowerCase() !== expectedEmail.toLowerCase()) {
        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Order not found" }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(orderLookupFixture));
      return;
    }

    if (requestUrl.pathname === "/api/order/view") {
      const token = requestUrl.searchParams.get("token") || "";
      const expectedToken = String(orderViewFixture?.data?.token || "");

      if (token !== expectedToken) {
        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "View token not found" }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(orderViewFixture));
      return;
    }

    if (requestUrl.pathname === "/api/products/discount") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, products: products.filter((item) => Number(item.discount || 0) > 0) }));
      return;
    }

    if (requestUrl.pathname === "/api/products/popular") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, products: products.slice(0, 8) }));
      return;
    }

    if (requestUrl.pathname === "/api/products/relatedProduct") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, products: products.slice(0, 8) }));
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/products\/[^/]+\/reviews\/summary$/)) {
      const productId = requestUrl.pathname.split("/")[3];
      const product = products.find((item) => String(item._id) === String(productId));
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, data: createReviewSummary(product) }));
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/products\/[^/]+\/reviews$/)) {
      const productId = requestUrl.pathname.split("/")[3];
      const product = products.find((item) => String(item._id) === String(productId));
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          success: true,
          data: {
            reviews: product
              ? [
                  {
                    reviewId: `review-${productId}`,
                    productId,
                    userName: "Test Kullanici",
                    rating: 5,
                    commentTitle: "Memnun kaldim",
                    commentBody: "Test ortaminda olusturulan ornek yorum.",
                    status: "APPROVED",
                    mediaUrls: product.image ? [product.image] : [],
                    helpfulCount: 2,
                    notHelpfulCount: 0,
                    createdAt: "2026-01-15T09:00:00.000Z",
                    updatedAt: "2026-01-15T09:00:00.000Z",
                  },
                ]
              : [],
            totalPages: 1,
            totalElements: product ? 1 : 0,
            page: 0,
            size: 10,
            summary: createReviewSummary(product),
          },
        })
      );
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/products\/[^/]+$/)) {
      const productId = requestUrl.pathname.split("/").pop();
      if (["show", "discount", "popular", "relatedProduct"].includes(String(productId))) {
        const fixturePath = fixtureMap.get(requestUrl.pathname);
        if (fixturePath) {
          try {
            const payload = await readJson(fixturePath);
            response.setHeader("Content-Type", "application/json");
            response.setHeader("Set-Cookie", "XSRF-TOKEN=test-env-xsrf; Path=/");
            response.writeHead(200);
            response.end(JSON.stringify(payload));
          } catch (error) {
            response.writeHead(500, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ success: false, message: error.message }));
          }
          return;
        }
      }

      const product = products.find((item) => String(item._id) === String(productId));
      if (!product) {
        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Product not found" }));
        return;
      }
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, data: product }));
      return;
    }

    const fixturePath = fixtureMap.get(requestUrl.pathname);

    if (!fixturePath) {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: false, message: "Fixture endpoint not found" }));
      return;
    }

    try {
      const payload = await readJson(fixturePath);
      response.setHeader("Content-Type", "application/json");
      response.setHeader("Set-Cookie", "XSRF-TOKEN=test-env-xsrf; Path=/");
      response.writeHead(200);
      response.end(JSON.stringify(payload));
    } catch (error) {
      response.writeHead(500, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: false, message: error.message }));
    }
  });

  server.listen(TEST_ENV_API_PORT, () => {
    console.log(`mock API ready on ${TEST_ENV_API_PORT}`);
    console.log(`frontend origin allowed: ${TEST_ENV_FRONTEND_ORIGIN}`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

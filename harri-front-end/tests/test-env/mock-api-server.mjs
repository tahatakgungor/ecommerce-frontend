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

const TEST_MOBILE_USER = {
  _id: "test-user-1",
  name: "Test Musteri",
  firstName: "Test",
  lastName: "Musteri",
  email: "customer+smoke@test.invalid",
  role: "User",
  phone: "05550000000",
  address: "Moda Caddesi No 10",
  city: "Istanbul",
  country: "Turkey",
  zipCode: "34710",
};

const TEST_MOBILE_LOGIN_CODE = "fixture-login-code-mobile-smoke";
const TEST_MOBILE_ACCESS_TOKEN = "fixture-mobile-access-token";
const TEST_CONVERSATION_ID = "fixture-conversation-id";
const TEST_CONFIRMATION_TOKEN = "fixture-confirmation-token";
const TEST_IYZICO_TOKEN = "fixture-iyzico-token";
const TEST_MOBILE_COUPONS = [
  {
    _id: "fixture-coupon-smoke-1",
    title: "Mobile Smoke Coupon",
    couponCode: "SMOKE5",
    discountPercentage: 5,
    minimumAmount: 0,
    productType: "",
    productScope: "ALL_PRODUCTS",
    status: "Active",
    scope: "PUBLIC",
    assignedUserEmail: "",
    startTime: "2026-01-01T00:00:00.000Z",
    endTime: "2028-01-01T00:00:00.000Z",
  },
];

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ı/g, "i")
    .toLowerCase()
    .trim();
}

function toSlug(value) {
  const normalized = normalizeText(value)
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "";
}

function normalizeSlugSet(value) {
  return String(value || "")
    .split(",")
    .map((item) => toSlug(item))
    .filter(Boolean);
}

function getCategoryCandidates(product) {
  return [
    product?.children,
    product?.category?.name,
    product?.category,
    product?.parent,
    product?.title,
    ...(Array.isArray(product?.tags) ? product.tags : []),
  ].filter(Boolean);
}

function getFilterablePrice(product) {
  const originalPrice = Number(product?.originalPrice);
  if (Number.isFinite(originalPrice) && originalPrice >= 0) return originalPrice;
  const price = Number(product?.price);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

function parseNullableNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function resolvePriceFilter(searchParams) {
  const min = parseNullableNumber(searchParams.get("priceMin"));
  const max = parseNullableNumber(searchParams.get("max"));
  const legacyMin = parseNullableNumber(searchParams.get("priceMax"));

  let nextMin = min ?? legacyMin;
  let nextMax = max;

  if (nextMin !== null && nextMax !== null && nextMin > nextMax) {
    [nextMin, nextMax] = [nextMax, nextMin];
  }

  return { min: nextMin, max: nextMax };
}

function matchesParentCategory(product, parentSlug, categoryScopeSlugs) {
  if (!parentSlug) return true;
  const productParentSlug = toSlug(product?.parent);
  if (
    productParentSlug &&
    (productParentSlug === parentSlug ||
      productParentSlug.includes(parentSlug) ||
      parentSlug.includes(productParentSlug))
  ) {
    return true;
  }

  if (!categoryScopeSlugs.length) return false;
  return getCategoryCandidates(product).some((candidate) => categoryScopeSlugs.includes(toSlug(candidate)));
}

function matchesCategory(product, categorySlug) {
  if (!categorySlug) return true;
  return getCategoryCandidates(product).some((candidate) => {
    const candidateSlug = toSlug(candidate);
    return candidateSlug === categorySlug || candidateSlug.includes(categorySlug);
  });
}

function matchesBrand(product, selectedBrands) {
  if (!selectedBrands.length) return true;
  return selectedBrands.includes(toSlug(product?.brand?.name));
}

function matchesSearch(product, query) {
  if (!query) return true;
  return [product?.title, product?.category?.name, product?.brand?.name]
    .filter(Boolean)
    .some((value) => normalizeText(value).includes(query));
}

function matchesPrice(product, priceFilter) {
  if (priceFilter.min === null && priceFilter.max === null) return true;
  const price = getFilterablePrice(product);
  if (!Number.isFinite(price)) return false;
  if (priceFilter.min !== null && price < priceFilter.min) return false;
  if (priceFilter.max !== null && price > priceFilter.max) return false;
  return true;
}

function sortProducts(products, sort) {
  const items = [...products];
  if (sort === "price_asc") {
    return items.sort((left, right) => getFilterablePrice(left) - getFilterablePrice(right));
  }
  if (sort === "price_desc") {
    return items.sort((left, right) => getFilterablePrice(right) - getFilterablePrice(left));
  }
  return items;
}

function buildBrandFacets(products) {
  const brandMap = new Map();
  for (const product of products) {
    const name = product?.brand?.name;
    const slug = toSlug(name);
    if (!slug) continue;
    const current = brandMap.get(slug) || { slug, name, count: 0 };
    current.count += 1;
    brandMap.set(slug, current);
  }

  return [...brandMap.values()].sort((left, right) => String(left.name || "").localeCompare(String(right.name || ""), "tr", {
    sensitivity: "base",
  }));
}

function buildPriceBounds(products) {
  const prices = products.map(getFilterablePrice).filter(Number.isFinite).sort((left, right) => left - right);
  if (!prices.length) return { min: 0, max: 0 };
  return { min: prices[0], max: prices.at(-1) };
}

function filterCatalog(products, searchParams) {
  const parentSlug = toSlug(searchParams.get("Category"));
  const categorySlug = toSlug(searchParams.get("category"));
  const categoryScopeSlugs = normalizeSlugSet(searchParams.get("categoryScope"));
  const selectedBrands = normalizeSlugSet(searchParams.get("brand"));
  const normalizedQuery = normalizeText(searchParams.get("q"));
  const priceFilter = resolvePriceFilter(searchParams);
  const sort = String(searchParams.get("sort") || "latest").toLowerCase();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const size = Math.max(1, Number(searchParams.get("size")) || products.length || 1);
  const includeFacets = searchParams.get("includeFacets") !== "false";

  const filtered = sortProducts(
    products.filter((product) =>
      matchesParentCategory(product, parentSlug, categoryScopeSlugs) &&
      matchesCategory(product, categorySlug) &&
      matchesBrand(product, selectedBrands) &&
      matchesSearch(product, normalizedQuery) &&
      matchesPrice(product, priceFilter)
    ),
    sort
  );

  const brandScope = products.filter((product) =>
    matchesParentCategory(product, parentSlug, categoryScopeSlugs) &&
    matchesCategory(product, categorySlug) &&
    matchesSearch(product, normalizedQuery) &&
    matchesPrice(product, priceFilter)
  );

  const priceScope = products.filter((product) =>
    matchesParentCategory(product, parentSlug, categoryScopeSlugs) &&
    matchesCategory(product, categorySlug) &&
    matchesBrand(product, selectedBrands) &&
    matchesSearch(product, normalizedQuery)
  );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const offset = (page - 1) * size;
  const paginated = searchParams.has("page") || searchParams.has("size");

  return {
    products: filtered.slice(offset, offset + size),
    total,
    page,
    size,
    totalPages,
    sort,
    paginated,
    facets: includeFacets ? { brands: buildBrandFacets(brandScope) } : null,
    priceBounds: includeFacets ? buildPriceBounds(priceScope) : null,
  };
}

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", TEST_ENV_FRONTEND_ORIGIN);
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-XSRF-TOKEN, X-Mobile-Client");
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

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8").trim();
  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return {};
  }
}

function hasValidAccessToken(request) {
  const authorization = request.headers.authorization || "";
  return authorization === `Bearer ${TEST_MOBILE_ACCESS_TOKEN}`;
}

function createAuthenticatedOrderFixture(orderLookupFixture) {
  const order = structuredClone(orderLookupFixture?.data?.order || {});
  order.email = TEST_MOBILE_USER.email;
  order.guestEmail = "";
  order.isGuest = false;
  order.name = TEST_MOBILE_USER.name;
  order.contact = TEST_MOBILE_USER.phone;
  order.address = TEST_MOBILE_USER.address;
  order.city = TEST_MOBILE_USER.city;
  order.country = TEST_MOBILE_USER.country;
  order.zipCode = TEST_MOBILE_USER.zipCode;
  return order;
}

async function startServer() {
  const fixtureMap = await loadFixtureMap();
  const orderLookupFixture = await readJson(ORDER_LOOKUP_FIXTURE_PATH);
  const orderViewFixture = await readJson(ORDER_VIEW_FIXTURE_PATH);
  const productsFixture = await readJson(getFixturePath("products-show.json"));
  const products = Array.isArray(productsFixture?.products) ? productsFixture.products : [];
  const authenticatedOrder = createAuthenticatedOrderFixture(orderLookupFixture);

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

    if (requestUrl.pathname === "/api/user/login" && request.method === "POST") {
      const body = await readRequestBody(request);
      if (body?.email !== TEST_MOBILE_USER.email || body?.password !== TEST_MOBILE_LOGIN_CODE) {
        response.writeHead(401, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Invalid credentials" }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          success: true,
          data: {
            token: TEST_MOBILE_ACCESS_TOKEN,
            user: TEST_MOBILE_USER,
          },
        })
      );
      return;
    }

    if (requestUrl.pathname === "/api/coupon") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ data: TEST_MOBILE_COUPONS }));
      return;
    }

    if (requestUrl.pathname === "/api/user/me") {
      if (!hasValidAccessToken(request)) {
        response.writeHead(401, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Unauthorized" }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(TEST_MOBILE_USER));
      return;
    }

    if (requestUrl.pathname === "/api/user/logout" && request.method === "POST") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, message: "Logged out" }));
      return;
    }

    if (requestUrl.pathname === "/api/user-order/order-by-user") {
      if (!hasValidAccessToken(request)) {
        response.writeHead(401, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Unauthorized" }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ orders: [authenticatedOrder] }));
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/user-order\/single-order\/[^/]+$/)) {
      if (!hasValidAccessToken(request)) {
        response.writeHead(401, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Unauthorized" }));
        return;
      }

      const orderId = requestUrl.pathname.split("/").pop() || "";
      if (orderId !== String(authenticatedOrder?._id || "")) {
        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Order not found" }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ order: authenticatedOrder }));
      return;
    }

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

    if (requestUrl.pathname === "/api/order/initialize-payment" && request.method === "POST") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          checkoutFormContent:
            "<div id='mock-iyzico'><h1>Mock Iyzico Checkout</h1><p>Smoke test payment shell</p></div>",
          conversationId: TEST_CONVERSATION_ID,
          confirmationToken: TEST_CONFIRMATION_TOKEN,
          token: TEST_IYZICO_TOKEN,
        })
      );
      return;
    }

    if (requestUrl.pathname === "/api/order/confirm-payment" && request.method === "POST") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          success: true,
          orderId: authenticatedOrder._id,
          order: authenticatedOrder,
        })
      );
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
      if (String(productId) === "show") {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(filterCatalog(products, requestUrl.searchParams)));
        return;
      }

      if (["discount", "popular", "relatedProduct"].includes(String(productId))) {
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

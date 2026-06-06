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
  savedAddresses: "",
};

const TEST_MOBILE_LOGIN_CODE = "fixture-login-code-mobile-smoke";
const TEST_MOBILE_ACCESS_TOKEN = "fixture-mobile-access-token";
const TEST_MOBILE_PASSWORD_CODE = "fixture-password-change-code";
const TEST_MOBILE_CONFIRM_EMAIL_TOKEN = "fixture-confirm-email-token";
const TEST_MOBILE_RESET_PASSWORD_TOKEN = "fixture-reset-password-token";
const TEST_CONVERSATION_ID = "fixture-conversation-id";
const TEST_CONFIRMATION_TOKEN = "fixture-confirmation-token";
const TEST_IYZICO_TOKEN = "fixture-iyzico-token";
const TEST_BLOG_POSTS = [
  {
    id: "blog-1",
    title: "Bagisiklik doneminde gunluk rutin nasil kurulabilir?",
    slug: "bagisiklik-doneminde-gunluk-rutin",
    summary: "Takviye, uyku ve su tuketimini ayni gunluk akista nasil dengeleyeceginizi anlatan rehber.",
    coverImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
    contentHtml:
      "<p>Gunluk rutinde takvime bagli kalmak kadar uyku ve su tuketimini birlikte yonetmek de onemlidir.</p><p>Sabah, ogle ve aksam bloklariyla dusunmek kullanicinin sureci surdurmesini kolaylastirir.</p>",
    relatedProductIds: [],
    publishedAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "blog-2",
    title: "Detoks kategorisinde urun secerken hangi sinyallere bakilmali?",
    slug: "detoks-kategorisinde-urun-secerken",
    summary: "Kategori secimi yaparken etiket, icerik ve kullanim notlari nasil okunmali sorusuna odaklanir.",
    coverImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
    contentHtml:
      "<p>Detoks urunlerinde kullanici ilk olarak urun icerigine, sonra kullanim notlarina bakmalidir.</p><p>Aciklama ile checkout kampanya dili arasinda tutarlilik olmasi guven yaratir.</p>",
    relatedProductIds: [],
    publishedAt: "2026-06-02T12:00:00.000Z",
    updatedAt: "2026-06-02T12:00:00.000Z",
  },
];
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
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
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

function buildReviewRowFromOrderItem(orderId, item, reviewRecord = null) {
  return {
    productId: item?._id || item?.id,
    orderId,
    title: item?.title || item?.name || "Urun",
    image: item?.image || item?.img || "",
    review: reviewRecord
      ? {
          reviewId: reviewRecord.reviewId,
          productId: reviewRecord.productId,
          rating: reviewRecord.rating,
          commentTitle: reviewRecord.commentTitle,
          commentBody: reviewRecord.commentBody,
          mediaUrls: Array.isArray(reviewRecord.mediaUrls) ? reviewRecord.mediaUrls : [],
          status: reviewRecord.status,
          updatedAt: reviewRecord.updatedAt,
        }
      : undefined,
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
  const reviewRecords = new Map();
  const returnRequests = [];
  const firstReviewedItem = Array.isArray(authenticatedOrder?.cart) ? authenticatedOrder.cart[0] : null;

  if (firstReviewedItem?._id) {
    reviewRecords.set(String(firstReviewedItem._id), {
      reviewId: `review-${firstReviewedItem._id}`,
      productId: String(firstReviewedItem._id),
      orderId: String(authenticatedOrder._id || ""),
      rating: 5,
      commentTitle: "Memnun kaldim",
      commentBody: "Test ortaminda olusturulan ornek yorum.",
      mediaUrls: firstReviewedItem.image ? [firstReviewedItem.image] : [],
      status: "APPROVED",
      updatedAt: "2026-01-15T09:00:00.000Z",
    });
  }

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

    if (requestUrl.pathname === "/api/user/signup" && request.method === "POST") {
      const body = await readRequestBody(request);
      if (!body?.email || !body?.password || !body?.confirmPassword || !body?.firstName || !body?.lastName) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Missing registration fields" }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          success: true,
          message: "Dogrulama e-postasi gonderildi. Gelen kutunuzu kontrol edin.",
        })
      );
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/user\/confirmEmail\/[^/]+$/) && request.method === "GET") {
      const token = requestUrl.pathname.split("/").pop() || "";
      if (token !== TEST_MOBILE_CONFIRM_EMAIL_TOKEN) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Dogrulama baglantisi gecersiz." }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          success: true,
          message: "E-posta adresiniz dogrulandi. Giris yapiliyor...",
          data: {
            token: TEST_MOBILE_ACCESS_TOKEN,
            user: TEST_MOBILE_USER,
          },
        })
      );
      return;
    }

    if (requestUrl.pathname === "/api/user/forget-password" && request.method === "PATCH") {
      const body = await readRequestBody(request);
      if (!String(body?.email || "").includes("@")) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Invalid email" }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          success: true,
          message: "Sifre sifirlama baglantisi e-posta adresinize gonderildi.",
        })
      );
      return;
    }

    if (requestUrl.pathname === "/api/user/confirm-forget-password" && request.method === "PATCH") {
      const body = await readRequestBody(request);
      if (String(body?.token || "") !== TEST_MOBILE_RESET_PASSWORD_TOKEN) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Sifre yenileme baglantisi gecersiz." }));
        return;
      }

      if (!body?.password || body?.password !== body?.confirmPassword) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Sifre bilgisi gecersiz." }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, message: "Sifreniz basariyla guncellendi." }));
      return;
    }

    if (requestUrl.pathname === "/api/coupon") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ data: TEST_MOBILE_COUPONS }));
      return;
    }

    if (requestUrl.pathname === "/api/blog" && request.method === "GET") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ posts: TEST_BLOG_POSTS }));
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/blog\/[^/]+$/) && request.method === "GET") {
      const slug = requestUrl.pathname.split("/").pop() || "";
      const post = TEST_BLOG_POSTS.find((item) => item.slug === slug);
      if (!post) {
        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Blog yazisi bulunamadi." }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ post }));
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

    if (requestUrl.pathname === "/api/user/update-user" && request.method === "PUT") {
      if (!hasValidAccessToken(request)) {
        response.writeHead(401, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Unauthorized" }));
        return;
      }

      const body = await readRequestBody(request);
      Object.assign(TEST_MOBILE_USER, {
        name: body?.name || TEST_MOBILE_USER.name,
        firstName: body?.firstName || TEST_MOBILE_USER.firstName,
        lastName: body?.lastName || TEST_MOBILE_USER.lastName,
        email: body?.email || TEST_MOBILE_USER.email,
        phone: body?.phone || TEST_MOBILE_USER.phone,
        address: body?.address || TEST_MOBILE_USER.address,
        city: body?.city || TEST_MOBILE_USER.city,
        country: body?.country || TEST_MOBILE_USER.country,
        zipCode: body?.zipCode || TEST_MOBILE_USER.zipCode,
        savedAddresses: body?.savedAddresses || TEST_MOBILE_USER.savedAddresses,
      });

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          success: true,
          message: "Bilgileriniz guncellendi.",
          data: {
            token: TEST_MOBILE_ACCESS_TOKEN,
            user: TEST_MOBILE_USER,
          },
        })
      );
      return;
    }

    if (requestUrl.pathname === "/api/user/change-password/request" && request.method === "PATCH") {
      if (!hasValidAccessToken(request)) {
        response.writeHead(401, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Unauthorized" }));
        return;
      }

      const body = await readRequestBody(request);
      if (!body?.currentPassword || !body?.newPassword) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Password payload missing" }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, message: "Dogrulama kodu e-posta adresinize gonderildi." }));
      return;
    }

    if (requestUrl.pathname === "/api/user/change-password/confirm" && request.method === "PATCH") {
      if (!hasValidAccessToken(request)) {
        response.writeHead(401, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Unauthorized" }));
        return;
      }

      const body = await readRequestBody(request);
      if (String(body?.code || "") !== TEST_MOBILE_PASSWORD_CODE) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Kod dogrulanamadi." }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, message: "Sifreniz basariyla guncellendi." }));
      return;
    }

    if (requestUrl.pathname === "/api/contact/send" && request.method === "POST") {
      const body = await readRequestBody(request);
      if (!body?.name || !body?.email || !body?.message) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Contact form incomplete" }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, message: "Mesajiniz destek ekibine iletildi." }));
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

    if (requestUrl.pathname === "/api/user-order/returns" && request.method === "GET") {
      if (!hasValidAccessToken(request)) {
        response.writeHead(401, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Unauthorized" }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ returns: returnRequests }));
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/user-order\/[^/]+\/returns$/) && request.method === "POST") {
      if (!hasValidAccessToken(request)) {
        response.writeHead(401, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Unauthorized" }));
        return;
      }

      const targetOrderId = requestUrl.pathname.split("/")[3] || "";
      if (targetOrderId !== String(authenticatedOrder?._id || "")) {
        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Order not found" }));
        return;
      }

      if (returnRequests.some((item) => item.orderId === targetOrderId)) {
        response.writeHead(409, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Bu siparis icin acik iade kaydi var." }));
        return;
      }

      const body = await readRequestBody(request);
      if (!String(body?.reason || "").trim()) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Iade nedeni gerekli." }));
        return;
      }

      const nextReturn = {
        _id: `return-${targetOrderId}`,
        orderId: targetOrderId,
        invoice: String(authenticatedOrder.invoice || ""),
        status: "REQUESTED",
        reason: String(body.reason || ""),
        customerNote: String(body.customerNote || ""),
        createdAt: "2026-06-06T09:30:00.000Z",
        updatedAt: "2026-06-06T09:30:00.000Z",
      };

      returnRequests.push(nextReturn);
      authenticatedOrder.hasOpenReturn = true;
      authenticatedOrder.returnStatus = "REQUESTED";

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, message: "Iade talebiniz alindi." }));
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

    if (requestUrl.pathname === "/api/user/reviews/overview" && request.method === "GET") {
      if (!hasValidAccessToken(request)) {
        response.writeHead(401, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Unauthorized" }));
        return;
      }

      const cartItems = Array.isArray(authenticatedOrder?.cart) ? authenticatedOrder.cart : [];
      const reviewed = [];
      const pending = [];

      for (const item of cartItems) {
        const productId = String(item?._id || item?.id || "");
        if (!productId) continue;
        const reviewRecord = reviewRecords.get(productId) || null;
        const row = buildReviewRowFromOrderItem(String(authenticatedOrder._id || ""), item, reviewRecord);
        if (reviewRecord?.reviewId) {
          reviewed.push(row);
        } else {
          pending.push(row);
        }
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ data: { pending, reviewed } }));
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/products\/[^/]+\/reviews\/summary$/)) {
      const productId = requestUrl.pathname.split("/")[3];
      const product = products.find((item) => String(item._id) === String(productId));
      const reviewRecord = reviewRecords.get(String(productId));
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          success: true,
          data: reviewRecord
            ? {
                averageRating: reviewRecord.rating,
                totalReviews: 1,
                ratings: {
                  5: reviewRecord.rating === 5 ? 1 : 0,
                  4: reviewRecord.rating === 4 ? 1 : 0,
                  3: reviewRecord.rating === 3 ? 1 : 0,
                  2: reviewRecord.rating === 2 ? 1 : 0,
                  1: reviewRecord.rating === 1 ? 1 : 0,
                },
                mediaCount: Array.isArray(reviewRecord.mediaUrls) ? reviewRecord.mediaUrls.length : 0,
              }
            : createReviewSummary(product),
        })
      );
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/products\/[^/]+\/reviews\/media-upload$/) && request.method === "POST") {
      if (!hasValidAccessToken(request)) {
        response.writeHead(401, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Unauthorized" }));
        return;
      }

      const productId = requestUrl.pathname.split("/")[3];
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          success: true,
          data: {
            url: `https://cdn.test.invalid/reviews/${encodeURIComponent(productId)}-${Date.now()}.jpg`,
          },
        })
      );
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/products\/[^/]+\/reviews$/)) {
      const productId = requestUrl.pathname.split("/")[3];
      const product = products.find((item) => String(item._id) === String(productId));

      if (request.method === "POST") {
        if (!hasValidAccessToken(request)) {
          response.writeHead(401, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ success: false, message: "Unauthorized" }));
          return;
        }

        const body = await readRequestBody(request);
        if (!product) {
          response.writeHead(404, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ success: false, message: "Product not found" }));
          return;
        }

        const nextReviewId = `review-${productId}`;
        reviewRecords.set(String(productId), {
          reviewId: nextReviewId,
          productId: String(productId),
          orderId: String(body?.orderId || authenticatedOrder._id || ""),
          rating: Number(body?.rating || 5),
          commentTitle: String(body?.commentTitle || ""),
          commentBody: String(body?.commentBody || ""),
          mediaUrls: [],
          status: "PENDING",
          updatedAt: "2026-06-06T09:40:00.000Z",
        });

        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: true, message: "Degerlendirmeniz alindi.", data: { reviewId: nextReviewId } }));
        return;
      }

      const reviewRecord = reviewRecords.get(String(productId));
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          success: true,
          data: {
            reviews: reviewRecord
              ? [
                  {
                    reviewId: reviewRecord.reviewId,
                    productId,
                    userName: "Test Kullanici",
                    rating: reviewRecord.rating,
                    commentTitle: reviewRecord.commentTitle,
                    commentBody: reviewRecord.commentBody,
                    status: reviewRecord.status,
                    mediaUrls: Array.isArray(reviewRecord.mediaUrls) ? reviewRecord.mediaUrls : [],
                    helpfulCount: 2,
                    notHelpfulCount: 0,
                    createdAt: reviewRecord.updatedAt,
                    updatedAt: reviewRecord.updatedAt,
                  },
                ]
              : [],
            totalPages: 1,
            totalElements: reviewRecord ? 1 : 0,
            page: 0,
            size: 10,
            summary: reviewRecord
              ? {
                  averageRating: reviewRecord.rating,
                  totalReviews: 1,
                  ratings: {
                    5: reviewRecord.rating === 5 ? 1 : 0,
                    4: reviewRecord.rating === 4 ? 1 : 0,
                    3: reviewRecord.rating === 3 ? 1 : 0,
                    2: reviewRecord.rating === 2 ? 1 : 0,
                    1: reviewRecord.rating === 1 ? 1 : 0,
                  },
                  mediaCount: Array.isArray(reviewRecord.mediaUrls) ? reviewRecord.mediaUrls.length : 0,
                }
              : createReviewSummary(product),
          },
        })
      );
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/products\/[^/]+\/reviews\/[^/]+$/) && request.method === "PUT") {
      if (!hasValidAccessToken(request)) {
        response.writeHead(401, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Unauthorized" }));
        return;
      }

      const [, , , productId, , reviewId] = requestUrl.pathname.split("/");
      const existing = reviewRecords.get(String(productId));
      if (!existing || existing.reviewId !== reviewId) {
        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Review not found" }));
        return;
      }

      const body = await readRequestBody(request);
      reviewRecords.set(String(productId), {
        ...existing,
        rating: Number(body?.rating || existing.rating || 5),
        commentTitle: String(body?.commentTitle || ""),
        commentBody: String(body?.commentBody || ""),
        status: "PENDING",
        updatedAt: "2026-06-06T09:45:00.000Z",
      });

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, message: "Degerlendirmeniz guncellendi." }));
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/products\/[^/]+\/reviews\/[^/]+\/me$/) && request.method === "DELETE") {
      if (!hasValidAccessToken(request)) {
        response.writeHead(401, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ success: false, message: "Unauthorized" }));
        return;
      }

      const productId = requestUrl.pathname.split("/")[3];
      reviewRecords.delete(String(productId));

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, message: "Degerlendirme silindi." }));
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

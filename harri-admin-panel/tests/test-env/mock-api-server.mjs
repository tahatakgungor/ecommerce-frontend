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
const ORDERS_FIXTURE_PATH = path.join(FIXTURE_ROOT, "admin-orders.json");
const COUPONS_FIXTURE_PATH = path.join(FIXTURE_ROOT, "admin-coupons.json");
const RETURNS_FIXTURE_PATH = path.join(FIXTURE_ROOT, "admin-returns.json");
const CONTACT_MESSAGES_FIXTURE_PATH = path.join(FIXTURE_ROOT, "admin-contact-messages.json");
const CUSTOMERS_FIXTURE_PATH = path.join(FIXTURE_ROOT, "admin-customers.json");
const STAFF_FIXTURE_PATH = path.join(FIXTURE_ROOT, "admin-staff.json");
const ACTIVITY_FIXTURE_PATH = path.join(FIXTURE_ROOT, "admin-activity-logs.json");
const NEWSLETTER_FIXTURE_PATH = path.join(FIXTURE_ROOT, "admin-newsletter.json");
const BLOG_FIXTURE_PATH = path.join(FIXTURE_ROOT, "admin-blog-posts.json");
const BANNERS_FIXTURE_PATH = path.join(FIXTURE_ROOT, "admin-banners.json");

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
  const ordersPayload = await readJson(ORDERS_FIXTURE_PATH);
  const couponsPayload = await readJson(COUPONS_FIXTURE_PATH);
  const returnsPayload = await readJson(RETURNS_FIXTURE_PATH);
  const contactPayload = await readJson(CONTACT_MESSAGES_FIXTURE_PATH);
  const customersPayload = await readJson(CUSTOMERS_FIXTURE_PATH);
  const staffPayload = await readJson(STAFF_FIXTURE_PATH);
  const activityPayload = await readJson(ACTIVITY_FIXTURE_PATH);
  const newsletterPayload = await readJson(NEWSLETTER_FIXTURE_PATH);
  const blogPayload = await readJson(BLOG_FIXTURE_PATH);
  const bannersPayload = await readJson(BANNERS_FIXTURE_PATH);

  return {
    products: Array.isArray(productsPayload?.data) ? productsPayload.data : [],
    reviews: Array.isArray(reviewsPayload?.data?.reviews) ? reviewsPayload.data.reviews : [],
    admin: adminPayload?.data || adminPayload,
    orders: Array.isArray(ordersPayload?.data?.orders) ? ordersPayload.data.orders : [],
    coupons: Array.isArray(couponsPayload?.data) ? couponsPayload.data : [],
    returns: Array.isArray(returnsPayload?.returns) ? returnsPayload.returns : [],
    contactMessages: Array.isArray(contactPayload?.data?.messages) ? contactPayload.data.messages : [],
    customers: Array.isArray(customersPayload?.data?.customers) ? customersPayload.data.customers : [],
    staff: Array.isArray(staffPayload?.data?.staff) ? staffPayload.data.staff : [],
    activityLogs: Array.isArray(activityPayload?.data?.logs) ? activityPayload.data.logs : [],
    newsletter: Array.isArray(newsletterPayload?.data?.subscribers) ? newsletterPayload.data.subscribers : [],
    blogPosts: Array.isArray(blogPayload?.data) ? blogPayload.data : [],
    banners: Array.isArray(bannersPayload?.data) ? bannersPayload.data : [],
  };
}

function writeJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
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

function createDashboardAmounts(orders) {
  const totals = orders.reduce(
    (acc, order) => {
      const amount = Number(order.totalAmount || 0);
      acc.totalOrderAmount += amount;
      if (acc.today.length < 1) acc.today.push(amount);
      else if (acc.yesterday.length < 1) acc.yesterday.push(amount);
      else acc.monthly.push(amount);
      return acc;
    },
    { totalOrderAmount: 0, today: [], yesterday: [], monthly: [] }
  );

  return {
    todayOrderAmount: totals.today.reduce((acc, value) => acc + value, 0),
    yesterdayOrderAmount: totals.yesterday.reduce((acc, value) => acc + value, 0),
    monthlyOrderAmount: totals.monthly.reduce((acc, value) => acc + value, 0),
    totalOrderAmount: totals.totalOrderAmount,
    todayCardPaymentAmount: totals.today.reduce((acc, value) => acc + value, 0),
    todayCashPaymentAmount: 0,
    yesterDayCardPaymentAmount: totals.yesterday.reduce((acc, value) => acc + value, 0),
    yesterDayCashPaymentAmount: 0,
  };
}

function createSalesReport(orders) {
  return orders
    .slice()
    .reverse()
    .map((order, index) => ({
      date: `2026-01-${String(9 + index).padStart(2, "0")}`,
      total: Number(order.totalAmount || 0),
      order: (order.cart || []).reduce((acc, item) => acc + Number(item.orderQuantity || 0), 0),
    }));
}

function createMostSellingCategory(orders) {
  const counts = new Map();
  for (const order of orders) {
    for (const item of order.cart || []) {
      const categoryName = item?.category?.name || item?.children || "Kategorisiz";
      const quantity = Number(item?.orderQuantity || 0);
      counts.set(categoryName, (counts.get(categoryName) || 0) + quantity);
    }
  }

  return {
    categoryData: [...counts.entries()].map(([categoryName, count]) => ({
      _id: categoryName,
      count,
    })),
  };
}

function createCategories(products) {
  const categoryMap = new Map();
  for (const product of products) {
    const parent = product?.parent || product?.category?.name || "Kategorisiz";
    const child = product?.children || product?.category?.name || "Genel";
    if (!categoryMap.has(parent)) {
      categoryMap.set(parent, new Set());
    }
    categoryMap.get(parent).add(child);
  }

  return [...categoryMap.entries()].map(([parent, children], index) => ({
    _id: `category-${index + 1}`,
    parent,
    children: [...children],
    products: products.filter((product) => (product?.parent || product?.category?.name || "Kategorisiz") === parent),
  }));
}

function createBrands(products) {
  const brandMap = new Map();
  for (const product of products) {
    const name = product?.brand?.name || "Bilinmeyen Marka";
    if (!brandMap.has(name)) {
      brandMap.set(name, {
        _id: product?.brand?.id || product?.brand?._id || `brand-${brandMap.size + 1}`,
        name,
        email: `${String(name).toLowerCase().replace(/\s+/g, "")}@test.local`,
        website: `https://${String(name).toLowerCase().replace(/\s+/g, "")}.test.local`,
        location: "Istanbul",
        logo: product?.image || "/assets/img/icons/upload.png",
      });
    }
  }
  return [...brandMap.values()];
}

function sortOrdersByCreatedAt(orders) {
  return [...orders].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function paginate(items, page, size) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeSize = Math.max(1, Number(size) || items.length || 1);
  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / safeSize);
  const start = (safePage - 1) * safeSize;
  return {
    items: items.slice(start, start + safeSize),
    total,
    page: safePage,
    size: safeSize,
    totalPages,
  };
}

function filterProducts(products, searchParams) {
  const query = String(searchParams.get("q") || "").trim().toLowerCase();
  const status = String(searchParams.get("status") || "").trim().toLowerCase();
  const page = searchParams.get("page");
  const size = searchParams.get("size");

  const filtered = [...products]
    .filter((product) => {
      const matchesQuery = query
        ? [product?.title, product?.sku, product?.brand?.name].some((value) =>
            String(value || "").toLowerCase().includes(query)
          )
        : true;
      const matchesStatus = status
        ? String(product?.status || "").toLowerCase() === status
        : true;
      return matchesQuery && matchesStatus;
    })
    .sort((left, right) => String(right?._id || "").localeCompare(String(left?._id || "")));

  return paginate(filtered, page, size);
}

function filterOrders(orders, searchParams) {
  const query = String(searchParams.get("q") || "").trim().toLowerCase();
  const statusParam = String(searchParams.get("status") || "").trim().toLowerCase();
  const normalizedStatus = statusParam === "cancel" ? "cancelled" : statusParam;
  const page = searchParams.get("page");
  const size = searchParams.get("size");

  const filtered = sortOrdersByCreatedAt(orders).filter((order) => {
    const matchesQuery = query
      ? [order?.invoice, order?.name, order?.guestEmail, order?.email].some((value) =>
          String(value || "").toLowerCase().includes(query)
        )
      : true;
    const matchesStatus = normalizedStatus
      ? String(order?.status || "").toLowerCase() === normalizedStatus
      : true;
    return matchesQuery && matchesStatus;
  });

  return paginate(filtered, page, size);
}

function filterCoupons(coupons, searchParams) {
  const query = String(searchParams.get("q") || "").trim().toLowerCase();
  const scope = String(searchParams.get("scope") || "").trim().toUpperCase();
  const page = searchParams.get("page");
  const size = searchParams.get("size");

  const filtered = [...coupons]
    .filter((coupon) => {
      const matchesQuery = query
        ? [coupon?.title, coupon?.couponCode, coupon?.assignedUserEmail, coupon?.productType].some((value) =>
            String(value || "").toLowerCase().includes(query)
          )
        : true;
      const matchesScope = !scope || scope === "ALL"
        ? true
        : scope === "PUBLIC"
          ? ["PUBLIC", "GENERAL"].includes(String(coupon?.scope || "").toUpperCase())
          : String(coupon?.scope || "").toUpperCase() === scope;
      return matchesQuery && matchesScope;
    })
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());

  return paginate(filtered, page, size);
}

function filterReturns(returns, searchParams) {
  const query = String(searchParams.get("q") || "").trim().toLowerCase();
  const status = String(searchParams.get("status") || "").trim().toUpperCase();
  const page = searchParams.get("page");
  const size = searchParams.get("size");

  const filtered = [...returns]
    .filter((item) => {
      const matchesQuery = query
        ? [item?.userEmail, item?.reason, item?.customerNote, item?.adminNote, item?.processedBy, item?.order?.invoice].some((value) =>
            String(value || "").toLowerCase().includes(query)
          )
        : true;
      const matchesStatus = !status || status === "ALL"
        ? true
        : String(item?.status || "").toUpperCase() === status;
      return matchesQuery && matchesStatus;
    })
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());

  return paginate(filtered, page, size);
}

function filterContactMessages(messages, searchParams) {
  const query = String(searchParams.get("q") || "").trim().toLowerCase();
  const status = String(searchParams.get("status") || "").trim().toUpperCase();
  const page = searchParams.get("page");
  const size = searchParams.get("size");

  const filtered = [...messages]
    .filter((item) => {
      const matchesQuery = query
        ? [item?.name, item?.email, item?.phone, item?.company, item?.message, item?.adminNote].some((value) =>
            String(value || "").toLowerCase().includes(query)
          )
        : true;
      const matchesStatus = !status || status === "ALL"
        ? true
        : String(item?.status || "").toUpperCase() === status;
      return matchesQuery && matchesStatus;
    })
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());

  return paginate(filtered, page, size);
}

function filterCustomers(customers, searchParams) {
  const query = String(searchParams.get("q") || "").trim().toLowerCase();
  const verification = String(searchParams.get("verification") || "").trim().toLowerCase();
  const page = searchParams.get("page");
  const size = searchParams.get("size");

  const filtered = [...customers]
    .filter((customer) => {
      const matchesQuery = query
        ? [customer?.name, customer?.email, customer?.phone, customer?.city].some((value) =>
            String(value || "").toLowerCase().includes(query)
          )
        : true;
      const matchesVerification = !verification || verification === "all"
        ? true
        : verification === "verified"
          ? Boolean(customer?.emailVerified)
          : !Boolean(customer?.emailVerified);
      return matchesQuery && matchesVerification;
    })
    .sort((left, right) => String(left?.email || "").localeCompare(String(right?.email || "")));

  return paginate(filtered, page, size);
}

function filterStaff(staff, searchParams) {
  const query = String(searchParams.get("q") || "").trim().toLowerCase();
  const role = String(searchParams.get("role") || "").trim().toLowerCase();
  const page = searchParams.get("page");
  const size = searchParams.get("size");

  const filtered = [...staff]
    .filter((item) => {
      const matchesQuery = query
        ? [item?.name, item?.email, item?.phone].some((value) =>
            String(value || "").toLowerCase().includes(query)
          )
        : true;
      const matchesRole = !role || role === "all"
        ? true
        : String(item?.role || "").toLowerCase() === role;
      return matchesQuery && matchesRole;
    })
    .sort((left, right) => String(left?.email || "").localeCompare(String(right?.email || "")));

  return paginate(filtered, page, size);
}

function filterActivityLogs(logs, searchParams) {
  const query = String(searchParams.get("q") || "").trim().toLowerCase();
  const eventType = String(searchParams.get("eventType") || "").trim();
  const page = searchParams.get("page");
  const size = searchParams.get("size");

  const filtered = [...logs]
    .filter((item) => {
      const matchesQuery = query
        ? [item?.message, item?.actor, item?.targetType, item?.targetId, item?.severity, JSON.stringify(item?.metadata || {})].some((value) =>
            String(value || "").toLowerCase().includes(query)
          )
        : true;
      const matchesEventType = !eventType
        ? true
        : String(item?.eventType || "") === eventType;
      return matchesQuery && matchesEventType;
    })
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());

  return paginate(filtered, page, size);
}

function filterNewsletter(subscribers, searchParams) {
  const query = String(searchParams.get("q") || "").trim().toLowerCase();
  const page = Number(searchParams.get("page") || 0);
  const size = Number(searchParams.get("size") || 20);

  const filtered = [...subscribers]
    .filter((item) => !query || String(item?.email || "").toLowerCase().includes(query))
    .sort((left, right) => new Date(right.subscribedAt || 0).getTime() - new Date(left.subscribedAt || 0).getTime());

  const start = Math.max(page, 0) * Math.max(size, 1);
  const totalPages = filtered.length === 0 ? 0 : Math.ceil(filtered.length / Math.max(size, 1));
  return {
    items: filtered.slice(start, start + Math.max(size, 1)),
    page: Math.max(page, 0),
    size: Math.max(size, 1),
    totalPages,
    totalElements: filtered.length,
  };
}

function filterBlogPosts(posts, searchParams) {
  const query = String(searchParams.get("q") || "").trim().toLowerCase();
  const status = String(searchParams.get("status") || "").trim().toLowerCase();
  const page = searchParams.get("page");
  const size = searchParams.get("size");

  const filtered = [...posts]
    .filter((post) => {
      const matchesQuery = query
        ? [post?.title, post?.slug, post?.summary].some((value) =>
            String(value || "").toLowerCase().includes(query)
          )
        : true;
      const matchesStatus = !status || status === "all"
        ? true
        : String(post?.status || "").toLowerCase() === status;
      return matchesQuery && matchesStatus;
    })
    .sort((left, right) => new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime());

  return paginate(filtered, page, size);
}

async function parseBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
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
      writeJson(response, 200, { ok: true, port: TEST_ENV_API_PORT });
      return;
    }

    if (requestUrl.pathname === "/api/admin/me") {
      response.setHeader("Set-Cookie", "XSRF-TOKEN=admin-test-env-xsrf; Path=/");
      writeJson(response, 200, { success: true, data: state.admin });
      return;
    }

    if (requestUrl.pathname === "/api/products/all") {
      const result = filterProducts(state.products, requestUrl.searchParams);
      writeJson(response, 200, {
        success: true,
        data: result.items,
        total: result.total,
        page: result.page,
        size: result.size,
        totalPages: result.totalPages,
      });
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/products\/[^/]+$/) && request.method === "GET") {
      const productId = requestUrl.pathname.split("/").pop();
      const product = state.products.find((item) => String(item._id) === String(productId));
      if (!product) {
        writeJson(response, 404, { success: false, message: "Product not found" });
        return;
      }
      writeJson(response, 200, { success: true, data: product });
      return;
    }

    if (requestUrl.pathname === "/api/category/all") {
      const categories = createCategories(state.products);
      if (requestUrl.searchParams.get("page") || requestUrl.searchParams.get("q")) {
        const query = String(requestUrl.searchParams.get("q") || "").trim().toLowerCase();
        const filtered = categories.filter((item) =>
          !query || [item.parent, ...(item.children || [])].some((value) => String(value || "").toLowerCase().includes(query))
        );
        const result = paginate(filtered, requestUrl.searchParams.get("page"), requestUrl.searchParams.get("size"));
        writeJson(response, 200, {
          success: true,
          data: {
            categories: result.items,
            total: result.total,
            page: result.page,
            size: result.size,
            totalPages: result.totalPages,
          },
        });
        return;
      }
      writeJson(response, 200, { success: true, data: categories, result: categories });
      return;
    }

    if (requestUrl.pathname === "/api/brand/all") {
      const brands = createBrands(state.products);
      if (requestUrl.searchParams.get("page") || requestUrl.searchParams.get("q")) {
        const query = String(requestUrl.searchParams.get("q") || "").trim().toLowerCase();
        const filtered = brands.filter((item) =>
          !query || [item.name, item.email, item.website, item.location].some((value) => String(value || "").toLowerCase().includes(query))
        );
        const result = paginate(filtered, requestUrl.searchParams.get("page"), requestUrl.searchParams.get("size"));
        writeJson(response, 200, {
          success: true,
          data: {
            brands: result.items,
            total: result.total,
            page: result.page,
            size: result.size,
            totalPages: result.totalPages,
          },
        });
        return;
      }
      writeJson(response, 200, { success: true, data: brands, result: brands });
      return;
    }

    if (requestUrl.pathname.startsWith("/api/products/update/") && request.method === "PUT") {
      const productId = requestUrl.pathname.split("/").pop();
      const body = await parseBody(request);
      const product = state.products.find((item) => String(item._id) === String(productId));
      if (product && body?.status) {
        product.status = String(body.status).toLowerCase();
      }
      writeJson(response, 200, { success: true });
      return;
    }

    if (requestUrl.pathname === "/api/admin/reviews" && request.method === "GET") {
      const status = requestUrl.searchParams.get("status") || "PENDING";
      const page = Number(requestUrl.searchParams.get("page") || 0);
      const size = Number(requestUrl.searchParams.get("size") || 20);
      writeJson(response, 200, createReviewResponse(state.reviews, status, page, size));
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/admin\/reviews\/[^/]+\/status$/) && request.method === "PATCH") {
      const reviewId = requestUrl.pathname.split("/")[4];
      const body = await parseBody(request);
      const review = state.reviews.find((item) => item.reviewId === reviewId);
      if (review && body?.status) {
        review.status = body.status;
        review.updatedAt = new Date("2026-01-15T10:00:00.000Z").toISOString();
      }
      writeJson(response, 200, { success: true, data: review });
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/admin\/reviews\/[^/]+$/) && request.method === "DELETE") {
      const reviewId = requestUrl.pathname.split("/").pop();
      state.reviews = state.reviews.filter((item) => item.reviewId !== reviewId);
      writeJson(response, 200, { success: true, message: "Deleted" });
      return;
    }

    if (requestUrl.pathname === "/api/user-order/dashboard-amount") {
      writeJson(response, 200, createDashboardAmounts(state.orders));
      return;
    }

    if (requestUrl.pathname === "/api/user-order/sales-report") {
      writeJson(response, 200, { salesReport: createSalesReport(state.orders) });
      return;
    }

    if (requestUrl.pathname === "/api/user-order/most-selling-category") {
      writeJson(response, 200, createMostSellingCategory(state.orders));
      return;
    }

    if (requestUrl.pathname === "/api/user-order/dashboard-recent-order") {
      const recentOrders = sortOrdersByCreatedAt(state.orders).slice(0, 5);
      writeJson(response, 200, { orders: recentOrders, totalOrder: recentOrders.length });
      return;
    }

    if (requestUrl.pathname === "/api/order/orders") {
      const result = filterOrders(state.orders, requestUrl.searchParams);
      writeJson(response, 200, {
        success: true,
        data: {
          orders: result.items,
          total: result.total,
          page: result.page,
          size: result.size,
          totalPages: result.totalPages,
        },
      });
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/order\/update-order\/[^/]+$/) && request.method === "PATCH") {
      const orderId = requestUrl.pathname.split("/").pop();
      const body = await parseBody(request);
      const order = state.orders.find((item) => String(item._id) === String(orderId));
      if (order && body?.status) {
        order.status = body.status;
      }
      writeJson(response, 200, { success: true, message: "Sipariş durumu güncellendi." });
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/order\/update-shipping\/[^/]+$/) && request.method === "PATCH") {
      const orderId = requestUrl.pathname.split("/").pop();
      const body = await parseBody(request);
      const order = state.orders.find((item) => String(item._id) === String(orderId));
      if (order) {
        order.shippingCarrier = body?.carrier || order.shippingCarrier;
        order.trackingNumber = body?.trackingNumber || order.trackingNumber;
      }
      writeJson(response, 200, { success: true, message: "Kargo bilgisi güncellendi." });
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/order\/[^/]+$/) && request.method === "GET") {
      const orderId = requestUrl.pathname.split("/").pop();
      const order = state.orders.find((item) => String(item._id) === String(orderId));
      if (!order) {
        writeJson(response, 404, { success: false, message: "Order not found" });
        return;
      }
      writeJson(response, 200, { success: true, data: { order } });
      return;
    }

    if (requestUrl.pathname === "/api/coupon" && request.method === "GET") {
      const result = filterCoupons(state.coupons, requestUrl.searchParams);
      writeJson(response, 200, {
        success: true,
        data: {
          coupons: result.items,
          total: result.total,
          page: result.page,
          size: result.size,
          totalPages: result.totalPages,
        },
      });
      return;
    }

    if (requestUrl.pathname === "/api/coupon/add" && request.method === "POST") {
      const body = await parseBody(request);
      const nextCoupon = {
        _id: `coupon-${state.coupons.length + 1}`,
        createdAt: "2026-01-15T09:00:00.000Z",
        updatedAt: "2026-01-15T09:00:00.000Z",
        status: "active",
        ...body,
      };
      state.coupons.unshift(nextCoupon);
      writeJson(response, 200, { message: "Coupon added successfully" });
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/coupon\/[^/]+$/) && request.method === "GET") {
      const couponId = requestUrl.pathname.split("/").pop();
      const coupon = state.coupons.find((item) => String(item._id) === String(couponId));
      if (!coupon) {
        writeJson(response, 404, { success: false, message: "Coupon not found" });
        return;
      }
      writeJson(response, 200, { success: true, data: coupon });
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/coupon\/[^/]+$/) && request.method === "PATCH") {
      const couponId = requestUrl.pathname.split("/").pop();
      const body = await parseBody(request);
      const coupon = state.coupons.find((item) => String(item._id) === String(couponId));
      if (coupon) {
        Object.assign(coupon, body, { updatedAt: "2026-01-15T10:00:00.000Z" });
      }
      writeJson(response, 200, { success: true, message: "Coupon updated successfully" });
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/coupon\/[^/]+$/) && request.method === "DELETE") {
      const couponId = requestUrl.pathname.split("/").pop();
      state.coupons = state.coupons.filter((item) => String(item._id) !== String(couponId));
      writeJson(response, 200, { success: true, message: "Coupon deleted successfully" });
      return;
    }

    if (requestUrl.pathname === "/api/admin/returns" && request.method === "GET") {
      const result = filterReturns(state.returns, requestUrl.searchParams);
      writeJson(response, 200, {
        success: true,
        returns: result.items,
        total: result.total,
        page: result.page,
        size: result.size,
        totalPages: result.totalPages,
      });
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/admin\/returns\/[^/]+\/status$/) && request.method === "PATCH") {
      const returnId = requestUrl.pathname.split("/")[4];
      const body = await parseBody(request);
      const returnItem = state.returns.find((item) => String(item._id) === String(returnId));
      if (returnItem && body?.status) {
        returnItem.status = body.status;
        returnItem.adminNote = body.adminNote || returnItem.adminNote;
        returnItem.processedBy = "Test Admin";
        returnItem.statusHistory = [
          ...(Array.isArray(returnItem.statusHistory) ? returnItem.statusHistory : []),
          {
            status: body.status,
            changedAt: "2026-01-15T10:00:00.000Z",
            actor: "Test Admin",
            note: body.adminNote || "",
          },
        ];
      }
      writeJson(response, 200, { success: true, data: returnItem });
      return;
    }

    if (requestUrl.pathname === "/api/admin/contact-messages" && request.method === "GET") {
      const result = filterContactMessages(state.contactMessages, requestUrl.searchParams);
      writeJson(response, 200, {
        success: true,
        data: {
          messages: result.items,
          total: result.total,
          page: result.page,
          size: result.size,
          totalPages: result.totalPages,
        },
      });
      return;
    }

    if (requestUrl.pathname === "/api/admin/all" && request.method === "GET") {
      const result = filterStaff(state.staff, requestUrl.searchParams);
      writeJson(response, 200, {
        success: true,
        data: {
          staff: result.items,
          total: result.total,
          page: result.page,
          size: result.size,
          totalPages: result.totalPages,
        },
      });
      return;
    }

    if (requestUrl.pathname === "/api/admin/activity-logs" && request.method === "GET") {
      const result = filterActivityLogs(state.activityLogs, requestUrl.searchParams);
      writeJson(response, 200, {
        success: true,
        data: {
          logs: result.items,
          total: result.total,
          page: result.page,
          size: result.size,
          totalPages: result.totalPages,
          eventTypes: Array.from(new Set(state.activityLogs.map((item) => item.eventType))).sort(),
        },
      });
      return;
    }

    if (requestUrl.pathname === "/api/admin/newsletter" && request.method === "GET") {
      const result = filterNewsletter(state.newsletter, requestUrl.searchParams);
      writeJson(response, 200, {
        success: true,
        data: {
          subscribers: result.items,
          page: result.page,
          size: result.size,
          totalPages: result.totalPages,
          totalElements: result.totalElements,
        },
      });
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/admin\/newsletter\/[^/]+$/) && request.method === "DELETE") {
      const subscriberId = Number(requestUrl.pathname.split("/").pop());
      state.newsletter = state.newsletter.filter((item) => Number(item.id) !== subscriberId);
      writeJson(response, 200, { success: true, message: "Abone silindi." });
      return;
    }

    if (requestUrl.pathname === "/api/admin/blog" && request.method === "GET") {
      if (requestUrl.searchParams.get("page") || requestUrl.searchParams.get("q") || requestUrl.searchParams.get("status")) {
        const result = filterBlogPosts(state.blogPosts, requestUrl.searchParams);
        writeJson(response, 200, {
          success: true,
          data: {
            posts: result.items,
            total: result.total,
            page: result.page,
            size: result.size,
            totalPages: result.totalPages,
          },
        });
        return;
      }
      writeJson(response, 200, { success: true, data: state.blogPosts, result: state.blogPosts });
      return;
    }

    if (requestUrl.pathname === "/api/admin/banners" && request.method === "GET") {
      writeJson(response, 200, { success: true, data: state.banners, result: state.banners });
      return;
    }

    if (requestUrl.pathname === "/api/admin/customers" && request.method === "GET") {
      const result = filterCustomers(state.customers, requestUrl.searchParams);
      writeJson(response, 200, {
        success: true,
        data: {
          customers: result.items,
          total: result.total,
          page: result.page,
          size: result.size,
          totalPages: result.totalPages,
        },
      });
      return;
    }

    if (requestUrl.pathname.match(/^\/api\/admin\/contact-messages\/[^/]+\/status$/) && request.method === "PATCH") {
      const messageId = requestUrl.pathname.split("/")[4];
      const body = await parseBody(request);
      const message = state.contactMessages.find((item) => String(item._id) === String(messageId));
      if (message && body?.status) {
        message.status = body.status;
        if (body.adminNote) {
          message.adminNote = body.adminNote;
        }
      }
      writeJson(response, 200, { success: true, data: message });
      return;
    }

    writeJson(response, 404, { success: false, message: "Fixture endpoint not found" });
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

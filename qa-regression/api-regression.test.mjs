import test from "node:test";
import assert from "node:assert/strict";

const API_BASE_URL = process.env.API_BASE_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const CUSTOMER_EMAIL = process.env.CUSTOMER_EMAIL;
const CUSTOMER_PASSWORD = process.env.CUSTOMER_PASSWORD;

const requiredEnv = [
  ["ADMIN_EMAIL", ADMIN_EMAIL],
  ["ADMIN_PASSWORD", ADMIN_PASSWORD],
  ["CUSTOMER_EMAIL", CUSTOMER_EMAIL],
  ["CUSTOMER_PASSWORD", CUSTOMER_PASSWORD],
];

function unique(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

async function request(method, path, { token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  return { status: res.status, ok: res.ok, json };
}

async function loginAdmin() {
  const res = await request("POST", "/api/admin/login", {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  assert.equal(res.status, 200, `Admin login basarisiz: ${JSON.stringify(res.json)}`);
  const token = res.json?.data?.token ?? res.json?.token;
  assert.ok(token, "Admin token donmedi");
  return token;
}

async function loginCustomer() {
  const res = await request("POST", "/api/user/login", {
    body: { email: CUSTOMER_EMAIL, password: CUSTOMER_PASSWORD },
  });
  assert.equal(res.status, 200, `Customer login basarisiz: ${JSON.stringify(res.json)}`);
  const token = res.json?.data?.token ?? res.json?.token;
  assert.ok(token, "Customer token donmedi");
  return token;
}

test("Auth guard blocks checkout endpoints without token", async () => {
  if (!API_BASE_URL) {
    test.skip("API_BASE_URL verilmedigi icin auth guard testi atlandi.");
    return;
  }

  const paymentRes = await request("POST", "/api/order/create-payment-intent", {
    body: {
      shippingCost: 0,
      cart: [{ _id: "00000000-0000-0000-0000-000000000000", orderQuantity: 1 }],
    },
  });
  assert.ok(
    paymentRes.status === 401 || paymentRes.status === 403,
    `Unauthorized create-payment-intent bekleniyordu, gelen: ${paymentRes.status}`
  );

  const addOrderRes = await request("POST", "/api/order/addOrder", {
    body: {
      name: "Unauthorized User",
      address: "Nope",
      contact: "000",
      email: "nope@example.com",
      city: "Nope",
      country: "TR",
      zipCode: "00000",
      shippingOption: "standard",
      shippingCost: 0,
      cart: [],
    },
  });
  assert.ok(
    addOrderRes.status === 401 || addOrderRes.status === 403,
    `Unauthorized addOrder bekleniyordu, gelen: ${addOrderRes.status}`
  );
});

test("Admin + Customer API regression flow", async () => {
  if (!API_BASE_URL) {
    test.skip("API_BASE_URL verilmedigi icin API regression flow atlandi.");
    return;
  }

  const missingEnv = requiredEnv.filter(([, value]) => !value).map(([key]) => key);
  if (missingEnv.length > 0) {
    test.skip(`Eksik env nedeniyle atlandi: ${missingEnv.join(", ")}`);
    return;
  }

  const adminToken = await loginAdmin();
  const customerToken = await loginCustomer();

  const me = await request("GET", "/api/user/me", { token: customerToken });
  assert.equal(me.status, 200, `Customer /me basarisiz: ${JSON.stringify(me.json)}`);
  assert.equal(
    (me.json?.email || "").toLowerCase(),
    CUSTOMER_EMAIL.toLowerCase(),
    "/api/user/me email eslesmedi"
  );

  const created = {
    brandId: null,
    categoryId: null,
    productId: null,
    couponId: null,
  };

  const brandName = unique("qa-brand");
  const categoryName = unique("qa-category");
  const productName = unique("qa-product");
  const couponCode = unique("QA").replace(/-/g, "").slice(0, 18).toUpperCase();

  try {
    const createBrand = await request("POST", "/api/brand/add", {
      token: adminToken,
      body: {
        name: brandName,
        description: "QA brand description",
        email: "qa-brand@example.com",
        website: "https://example.com",
        location: "Istanbul",
        logo: "https://example.com/brand.png",
        status: "Active",
      },
    });
    assert.equal(createBrand.status, 200, `Brand create basarisiz: ${JSON.stringify(createBrand.json)}`);
    created.brandId = createBrand.json?.data?.id ?? createBrand.json?.data?._id;
    assert.ok(created.brandId, "Brand id donmedi");

    const updateBrand = await request("PUT", `/api/brand/update/${created.brandId}`, {
      token: adminToken,
      body: {
        name: `${brandName}-updated`,
        description: "QA brand updated",
        email: "qa-brand-updated@example.com",
        website: "https://example.com/updated",
        location: "Ankara",
        logo: "https://example.com/brand-updated.png",
        status: "Active",
      },
    });
    assert.equal(updateBrand.status, 200, `Brand update basarisiz: ${JSON.stringify(updateBrand.json)}`);

    const createCategory = await request("POST", "/api/category/add", {
      token: adminToken,
      body: {
        parent: categoryName,
        description: "QA category description",
        image: "https://example.com/category.png",
        children: ["QA Child 1", "QA Child 2"],
      },
    });
    assert.equal(createCategory.status, 200, `Category create basarisiz: ${JSON.stringify(createCategory.json)}`);
    created.categoryId = createCategory.json?.data?.id ?? createCategory.json?.data?._id;
    assert.ok(created.categoryId, "Category id donmedi");

    const updateCategory = await request("PUT", `/api/category/update/${created.categoryId}`, {
      token: adminToken,
      body: {
        parent: `${categoryName}-updated`,
        description: "QA category updated",
        image: "https://example.com/category-updated.png",
        children: ["QA Child 1", "QA Child 3"],
      },
    });
    assert.equal(updateCategory.status, 200, `Category update basarisiz: ${JSON.stringify(updateCategory.json)}`);

    const createProduct = await request("POST", "/api/products/add", {
      token: adminToken,
      body: {
        title: productName,
        sku: unique("SKU"),
        parent: `${categoryName}-updated`,
        children: "QA Child 1",
        tags: ["qa", "regression"],
        image: "https://example.com/product.png",
        originalPrice: 299.99,
        price: 249.99,
        relatedImages: ["https://example.com/product-2.png"],
        description: "QA product description",
        brand: { name: `${brandName}-updated` },
        category: { name: `${categoryName}-updated` },
        quantity: 50,
        colors: ["Green"],
        status: "Active",
      },
    });
    assert.equal(createProduct.status, 200, `Product create basarisiz: ${JSON.stringify(createProduct.json)}`);
    created.productId = createProduct.json?.data?.id ?? createProduct.json?.data?._id;
    assert.ok(created.productId, "Product id donmedi");

    const updateProductStatus = await request("PUT", `/api/products/update/${created.productId}`, {
      token: adminToken,
      body: { status: "Inactive" },
    });
    assert.equal(
      updateProductStatus.status,
      200,
      `Product status update basarisiz: ${JSON.stringify(updateProductStatus.json)}`
    );

    const createCoupon = await request("POST", "/api/coupon/add", {
      token: adminToken,
      body: {
        title: "QA Public Coupon",
        couponCode,
        endTime: "2099-12-31T23:59:59+03:00",
        startTime: "2025-01-01T00:00:00+03:00",
        discountPercentage: 10,
        minimumAmount: 50,
        productType: `${categoryName}-updated`,
        status: "Active",
        scope: "PUBLIC",
      },
    });
    assert.equal(createCoupon.status, 200, `Coupon create basarisiz: ${JSON.stringify(createCoupon.json)}`);
    created.couponId = createCoupon.json?.data?.id ?? createCoupon.json?.data?._id;
    assert.ok(created.couponId, "Coupon id donmedi");

    const coupons = await request("GET", "/api/coupon", { token: adminToken });
    assert.equal(coupons.status, 200, `Coupon list basarisiz: ${JSON.stringify(coupons.json)}`);
    const foundCoupon = (coupons.json?.data ?? []).find((c) => c.couponCode === couponCode);
    assert.ok(foundCoupon, "Olusturulan kupon listede yok");

    const activateProduct = await request("PUT", `/api/products/update/${created.productId}`, {
      token: adminToken,
      body: { status: "Active" },
    });
    assert.equal(activateProduct.status, 200, `Product re-activate basarisiz: ${JSON.stringify(activateProduct.json)}`);

    const createPaymentIntent = await request("POST", "/api/order/create-payment-intent", {
      token: customerToken,
      body: {
        shippingCost: 25,
        cart: [{ _id: created.productId, orderQuantity: 1 }],
      },
    });
    assert.equal(
      createPaymentIntent.status,
      200,
      `Create payment intent basarisiz: ${JSON.stringify(createPaymentIntent.json)}`
    );
    const paymentIntentSecret =
      createPaymentIntent.json?.clientSecret ??
      createPaymentIntent.json?.data?.clientSecret;
    assert.ok(paymentIntentSecret, "create-payment-intent clientSecret donmedi");

    const createOrder = await request("POST", "/api/order/addOrder", {
      token: customerToken,
      body: {
        name: "QA Customer",
        address: "QA Street",
        contact: "5550001111",
        email: CUSTOMER_EMAIL,
        city: "Istanbul",
        country: "TR",
        zipCode: "34000",
        shippingOption: "standard",
        shippingCost: 25,
        couponCode,
        cart: [{ _id: created.productId, orderQuantity: 1 }],
      },
    });
    assert.equal(createOrder.status, 200, `Order create basarisiz: ${JSON.stringify(createOrder.json)}`);
    assert.equal(createOrder.json?.success, true, "Order response success=false");
    assert.equal(createOrder.json?.order?.couponCode, couponCode, "Order couponCode eslesmedi");

    const customerOrders = await request("GET", "/api/user-order/order-by-user", { token: customerToken });
    assert.equal(customerOrders.status, 200, `Customer order list basarisiz: ${JSON.stringify(customerOrders.json)}`);
    assert.ok(Array.isArray(customerOrders.json?.orders), "orders alani dizi degil");

    const allOrders = await request("GET", "/api/order/orders", { token: adminToken });
    assert.equal(allOrders.status, 200, `Admin order list basarisiz: ${JSON.stringify(allOrders.json)}`);
    assert.equal(allOrders.json?.success, true, "Admin order list success=false");
  } finally {
    if (created.couponId) {
      await request("DELETE", `/api/coupon/${created.couponId}`, { token: adminToken });
    }
    if (created.productId) {
      await request("DELETE", `/api/products/${created.productId}`, { token: adminToken });
    }
    if (created.categoryId) {
      await request("DELETE", `/api/category/delete/${created.categoryId}`, { token: adminToken });
    }
    if (created.brandId) {
      await request("DELETE", `/api/brand/delete/${created.brandId}`, { token: adminToken });
    }
  }
});

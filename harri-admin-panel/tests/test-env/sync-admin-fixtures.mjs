import path from "node:path";
import {
  FIXTURE_MANIFEST_PATH,
  FIXTURE_ROOT,
  STOREFRONT_PRODUCT_FIXTURE,
  ensureFixtureDirectory,
  fileExists,
  readJson,
  writeJson,
} from "./shared.mjs";

const PRODUCTS_FIXTURE_PATH = path.join(FIXTURE_ROOT, "products-all.json");
const REVIEWS_FIXTURE_PATH = path.join(FIXTURE_ROOT, "admin-reviews.json");
const ADMIN_ME_FIXTURE_PATH = path.join(FIXTURE_ROOT, "admin-me.json");
const ORDERS_FIXTURE_PATH = path.join(FIXTURE_ROOT, "admin-orders.json");
const COUPONS_FIXTURE_PATH = path.join(FIXTURE_ROOT, "admin-coupons.json");
const RETURNS_FIXTURE_PATH = path.join(FIXTURE_ROOT, "admin-returns.json");
const CONTACT_MESSAGES_FIXTURE_PATH = path.join(FIXTURE_ROOT, "admin-contact-messages.json");
const FIXTURE_BASE_TIMESTAMP = Date.UTC(2026, 0, 15, 9, 0, 0);
const DAY_IN_MS = 86400000;
const HOUR_IN_MS = 3600000;

function toFixtureDate(dayOffset = 0, hourOffset = 0) {
  return new Date(FIXTURE_BASE_TIMESTAMP - dayOffset * DAY_IN_MS - hourOffset * HOUR_IN_MS).toISOString();
}

function toAdminProduct(product, index) {
  return {
    _id: product?._id || `fixture-product-${index + 1}`,
    sku: product?.sku || `SKU-${index + 1}`,
    title: product?.title || `Fixture Product ${index + 1}`,
    parent: product?.parent || "",
    children: product?.children || product?.category?.name || "",
    tags: Array.isArray(product?.tags) ? product.tags : [],
    image: product?.image || product?.relatedImages?.[0] || "/assets/img/icons/upload.png",
    originalPrice: Number(product?.originalPrice || product?.price || 0),
    price: Number(product?.price || product?.originalPrice || 0),
    discount: Number(product?.discount || 0),
    relatedImages: Array.isArray(product?.relatedImages) ? product.relatedImages : [],
    description: product?.description || "",
    orderQuantity: Number(product?.orderQuantity || 0),
    brand: {
      name: product?.brand?.name || "Bilinmeyen Marka",
      id: product?.brand?.id || product?.brand?._id || `brand-${index + 1}`,
    },
    category: {
      name: product?.category?.name || product?.children || "Kategorisiz",
      id: product?.category?.id || product?.category?._id || `category-${index + 1}`,
    },
    unit: product?.unit || "Adet",
    quantity: Number(product?.quantity || 0),
    colors: Array.isArray(product?.colors) ? product.colors : [],
    type: product?.type || "",
    itemInfo: product?.itemInfo || "",
    status: product?.status || "active",
  };
}

function createReviewFixtures(products) {
  const sourceProducts = products.slice(0, 3);
  const statuses = ["PENDING", "APPROVED", "REJECTED"];

  return statuses.map((status, index) => {
    const product = sourceProducts[index % sourceProducts.length];
    return {
      reviewId: `review-${index + 1}`,
      productId: product?._id || `fixture-product-${index + 1}`,
      userId: `user-${index + 1}`,
      userName: ["Ayse Yilmaz", "Mehmet Demir", "Elif Kaya"][index] || `User ${index + 1}`,
      rating: 5 - index,
      commentTitle: ["Etkili urun", "Fena degil", "Beklentiyi karsilamadi"][index] || "",
      commentBody: [
        "Kullanimi kolay ve etkisini hizli gosteren bir urun.",
        "Genel olarak memnun kaldim ama kargo kutusu daha iyi olabilirdi.",
        "Kisisel beklentime uygun olmadi.",
      ][index],
      status,
      verifiedPurchase: index !== 2,
      mediaUrls: product?.image ? [product.image] : [],
      helpfulCount: 4 - index,
      notHelpfulCount: index,
      createdAt: toFixtureDate(index, 0),
      updatedAt: toFixtureDate(0, index),
    };
  });
}

function createOrderItem(product, quantity) {
  return {
    ...product,
    orderQuantity: quantity,
    price: Number(product?.price || product?.originalPrice || 0),
    originalPrice: Number(product?.originalPrice || product?.price || 0),
  };
}

function createOrderFixtures(products) {
  const sourceProducts = products.length ? products : [toAdminProduct({}, 0)];
  const orderDefinitions = [
    {
      suffix: "1",
      invoice: 5001,
      name: "Zeynep Kaya",
      email: "zeynep@test.local",
      status: "delivered",
      paymentMethod: "credit_card",
      createdAt: toFixtureDate(0, 2),
      isGuest: false,
      shippingCarrier: "Aras Kargo",
      trackingNumber: "ARAS123456",
      shippedAt: toFixtureDate(0, 1),
    },
    {
      suffix: "2",
      invoice: 5002,
      name: "Mert Demir",
      email: "mert@test.local",
      status: "processing",
      paymentMethod: "credit_card",
      createdAt: toFixtureDate(1, 3),
      isGuest: false,
    },
    {
      suffix: "3",
      invoice: 5003,
      name: "Sena Yildiz",
      email: "sena@test.local",
      status: "pending",
      paymentMethod: "cash",
      createdAt: toFixtureDate(2, 4),
      isGuest: true,
      guestEmail: "sena@test.local",
    },
    {
      suffix: "4",
      invoice: 5004,
      name: "Ali Can",
      email: "ali@test.local",
      status: "cancelled",
      paymentMethod: "credit_card",
      createdAt: toFixtureDate(3, 5),
      isGuest: false,
    },
  ];

  return orderDefinitions.map((definition, index) => {
    const firstProduct = sourceProducts[index % sourceProducts.length];
    const secondProduct = sourceProducts[(index + 1) % sourceProducts.length];
    const cart = [
      createOrderItem(firstProduct, 1),
      createOrderItem(secondProduct, 2),
    ];
    const subTotal = cart.reduce(
      (acc, item) => acc + Number(item.price || 0) * Number(item.orderQuantity || 0),
      0
    );
    const shippingCost = 49.9;

    return {
      _id: `order-${definition.suffix}`,
      user: {
        _id: `user-${definition.suffix}`,
        name: definition.name,
        email: definition.email,
        role: "user",
        status: "active",
        createdAt: toFixtureDate(10 + index, 0),
        updatedAt: toFixtureDate(5 + index, 0),
      },
      cart,
      name: definition.name,
      address: "Test Mahallesi No: 10",
      email: definition.email,
      contact: "05550000000",
      city: "Istanbul",
      country: "Turkiye",
      zipCode: "34000",
      subTotal: Number(subTotal.toFixed(2)),
      shippingCost,
      discount: 0,
      totalAmount: Number((subTotal + shippingCost).toFixed(2)),
      shippingOption: "standart",
      paymentMethod: definition.paymentMethod,
      orderNote: "Test ortaminda uretilen siparis.",
      invoice: definition.invoice,
      status: definition.status,
      hasOpenReturn: definition.status === "delivered",
      isGuest: definition.isGuest,
      guestEmail: definition.guestEmail || null,
      guestName: definition.isGuest ? definition.name : null,
      guestPhone: definition.isGuest ? "05550000001" : null,
      createdAt: definition.createdAt,
      updatedAt: definition.createdAt,
      shippingCarrier: definition.shippingCarrier || "",
      trackingNumber: definition.trackingNumber || "",
      shippedAt: definition.shippedAt || null,
      agreementAccepted: true,
      agreementAcceptedAt: definition.createdAt,
    };
  });
}

function createCouponFixtures(products) {
  const defaultType = products[0]?.category?.name || "Genel";
  return [
    {
      _id: "coupon-1",
      title: "Hos Geldin",
      logo: products[0]?.image || "/assets/img/icons/upload.png",
      couponCode: "HOS10",
      endTime: toFixtureDate(-7, 0),
      discountPercentage: 10,
      minimumAmount: 250,
      productType: defaultType,
      productScope: "ALL_PRODUCTS",
      startTime: toFixtureDate(15, 0),
      createdAt: toFixtureDate(15, 0),
      updatedAt: toFixtureDate(1, 0),
      status: "active",
      scope: "GENERAL",
      assignedUserEmail: null,
      assignedUserId: null,
    },
    {
      _id: "coupon-2",
      title: "Sadakat",
      logo: products[1]?.image || "/assets/img/icons/upload.png",
      couponCode: "SADAKAT15",
      endTime: toFixtureDate(-10, 0),
      discountPercentage: 15,
      minimumAmount: 400,
      productType: defaultType,
      productScope: "CATEGORY",
      startTime: toFixtureDate(20, 0),
      createdAt: toFixtureDate(20, 0),
      updatedAt: toFixtureDate(2, 0),
      status: "active",
      scope: "USER",
      assignedUserEmail: "zeynep@test.local",
      assignedUserId: "user-1",
    },
    {
      _id: "coupon-3",
      title: "Kisa Kampanya",
      logo: products[2]?.image || "/assets/img/icons/upload.png",
      couponCode: "KISA5",
      endTime: toFixtureDate(1, 0),
      discountPercentage: 5,
      minimumAmount: 150,
      productType: defaultType,
      productScope: "ALL_PRODUCTS",
      startTime: toFixtureDate(12, 0),
      createdAt: toFixtureDate(12, 0),
      updatedAt: toFixtureDate(3, 0),
      status: "expired",
      scope: "GENERAL",
      assignedUserEmail: null,
      assignedUserId: null,
    },
  ];
}

function createReturnFixtures(orders) {
  const deliveredOrder = orders.find((order) => order.status === "delivered") || orders[0];
  const processingOrder = orders.find((order) => order.status === "processing") || orders[1] || orders[0];

  return [
    {
      _id: "return-1",
      orderId: deliveredOrder._id,
      userEmail: deliveredOrder.email,
      order: { invoice: deliveredOrder.invoice },
      reason: "Urun beklentimi karsilamadi",
      customerNote: "Paket acildi ama urunu kullanmadim.",
      adminNote: "",
      processedBy: null,
      status: "REQUESTED",
      createdAt: toFixtureDate(0, 0),
      statusHistory: [{ status: "REQUESTED", changedAt: toFixtureDate(0, 0), actor: "customer" }],
    },
    {
      _id: "return-2",
      orderId: processingOrder._id,
      userEmail: processingOrder.email,
      order: { invoice: processingOrder.invoice },
      reason: "Yanlis urun secimi",
      customerNote: "Degisim yerine iade istiyorum.",
      adminNote: "Urun depoya ulaştığında iade tamamlanacak.",
      processedBy: "Test Admin",
      status: "APPROVED",
      createdAt: toFixtureDate(1, 1),
      statusHistory: [
        { status: "REQUESTED", changedAt: toFixtureDate(1, 1), actor: "customer" },
        { status: "APPROVED", changedAt: toFixtureDate(0, 5), actor: "Test Admin", note: "Iade onaylandi." },
      ],
    },
  ];
}

function createContactMessages() {
  return [
    {
      _id: "contact-1",
      name: "Esra Yilmaz",
      email: "esra@test.local",
      phone: "05551112233",
      company: "Serravit Bayi",
      message: "Toplu alim icin fiyat bilgisi almak istiyorum.",
      status: "NEW",
      createdAt: toFixtureDate(0, 4),
    },
    {
      _id: "contact-2",
      name: "Bora Aydin",
      email: "bora@test.local",
      phone: "05554443322",
      company: "Aydin Tarim",
      message: "Siparisimdeki urunun teslim tarihi hakkinda bilgi alabilir miyim?",
      status: "IN_PROGRESS",
      createdAt: toFixtureDate(1, 2),
    },
    {
      _id: "contact-3",
      name: "Melis Can",
      email: "melis@test.local",
      phone: "05557778899",
      company: "",
      message: "Kullanım sekli ile ilgili destek rica ediyorum.",
      status: "RESOLVED",
      createdAt: toFixtureDate(2, 1),
    },
  ];
}

async function syncAdminFixtures() {
  await ensureFixtureDirectory();

  if (!(await fileExists(STOREFRONT_PRODUCT_FIXTURE))) {
    throw new Error(
      `Storefront product fixture missing: ${STOREFRONT_PRODUCT_FIXTURE}. Run frontend test env sync first.`
    );
  }

  const storefrontProductsPayload = await readJson(STOREFRONT_PRODUCT_FIXTURE);
  const storefrontProducts = Array.isArray(storefrontProductsPayload?.products)
    ? storefrontProductsPayload.products
    : [];

  const adminProducts = storefrontProducts.map(toAdminProduct);
  const adminReviews = createReviewFixtures(adminProducts);
  const adminOrders = createOrderFixtures(adminProducts);
  const adminCoupons = createCouponFixtures(adminProducts);
  const adminReturns = createReturnFixtures(adminOrders);
  const adminContactMessages = createContactMessages();
  const adminMe = {
    success: true,
    data: {
      _id: "fixture-admin-1",
      name: "Test Admin",
      email: "admin@test.local",
      role: "Admin",
      token: "fixture-admin-token",
    },
  };

  await writeJson(PRODUCTS_FIXTURE_PATH, {
    success: true,
    data: adminProducts,
  });

  await writeJson(REVIEWS_FIXTURE_PATH, {
    success: true,
    data: {
      status: "PENDING",
      page: 0,
      size: 20,
      totalPages: 1,
      totalElements: adminReviews.length,
      reviews: adminReviews,
    },
  });

  await writeJson(ORDERS_FIXTURE_PATH, {
    success: true,
    data: {
      orders: adminOrders,
      total: adminOrders.length,
    },
  });

  await writeJson(COUPONS_FIXTURE_PATH, {
    success: true,
    data: adminCoupons,
  });

  await writeJson(RETURNS_FIXTURE_PATH, {
    success: true,
    returns: adminReturns,
  });

  await writeJson(CONTACT_MESSAGES_FIXTURE_PATH, {
    success: true,
    data: {
      messages: adminContactMessages,
      total: adminContactMessages.length,
    },
  });

  await writeJson(ADMIN_ME_FIXTURE_PATH, adminMe);

  await writeJson(FIXTURE_MANIFEST_PATH, {
    source: "storefront-product-fixtures",
    products: adminProducts.length,
    reviews: adminReviews.length,
    orders: adminOrders.length,
    coupons: adminCoupons.length,
    returns: adminReturns.length,
    contactMessages: adminContactMessages.length,
  });

  console.log(`synced admin products -> ${PRODUCTS_FIXTURE_PATH}`);
  console.log(`synced admin reviews -> ${REVIEWS_FIXTURE_PATH}`);
  console.log(`synced admin orders -> ${ORDERS_FIXTURE_PATH}`);
  console.log(`synced admin coupons -> ${COUPONS_FIXTURE_PATH}`);
  console.log(`synced admin returns -> ${RETURNS_FIXTURE_PATH}`);
  console.log(`synced admin contact messages -> ${CONTACT_MESSAGES_FIXTURE_PATH}`);
  console.log(`synced admin me -> ${ADMIN_ME_FIXTURE_PATH}`);
}

syncAdminFixtures().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

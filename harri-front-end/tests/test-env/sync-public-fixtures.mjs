import {
  ORDER_LOOKUP_FIXTURE_PATH,
  ORDER_VIEW_FIXTURE_PATH,
  LIVE_PUBLIC_API_ORIGIN,
  PUBLIC_FIXTURES,
  FIXTURE_MANIFEST_PATH,
  ensureFixtureDirectory,
  getFixturePath,
  pickCollectionCount,
  readJson,
  writeJson,
} from "./shared.mjs";

const FIXTURE_BASE_TIMESTAMP = Date.UTC(2026, 0, 15, 9, 0, 0);

function createGuestOrder(products = []) {
  const sourceProducts = Array.isArray(products) ? products.slice(0, 2) : [];
  const cart = sourceProducts.map((product, index) => {
    const quantity = index + 1;
    const unitPrice = Number(product?.price || product?.originalPrice || 0);
    return {
      ...product,
      orderQuantity: quantity,
      price: unitPrice,
      originalPrice: Number(product?.originalPrice || unitPrice),
    };
  });

  const subtotal = cart.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.orderQuantity || 0), 0);
  const shippingCost = 49.9;

  return {
    _id: "fixture-order-1",
    invoice: "SRV-1001",
    name: "Misafir Kullanici",
    firstName: "Misafir",
    lastName: "Kullanici",
    country: "Turkiye",
    city: "Istanbul",
    contact: "05551234567",
    email: "guest@test.local",
    guestEmail: "guest@test.local",
    isGuest: true,
    cart,
    cardInfo: { type: "Kredi Karti" },
    paymentMethod: "Kredi Karti",
    status: "delivered",
    shippingCost,
    discount: 0,
    totalAmount: Number((subtotal + shippingCost).toFixed(2)),
    shippingCarrier: "Aras Kargo",
    trackingNumber: "TEST123456",
    shippedAt: new Date(FIXTURE_BASE_TIMESTAMP - 2 * 3600000).toISOString(),
    createdAt: new Date(FIXTURE_BASE_TIMESTAMP - 86400000).toISOString(),
    updatedAt: new Date(FIXTURE_BASE_TIMESTAMP - 3600000).toISOString(),
    orderNote: "Test ortaminda olusturulan siparis.",
  };
}

async function syncFixtures() {
  await ensureFixtureDirectory();

  const manifest = {
    sourceBaseUrl: LIVE_PUBLIC_API_ORIGIN,
    fixtures: [],
  };

  for (const fixture of PUBLIC_FIXTURES) {
    const url = new URL(fixture.endpoint, LIVE_PUBLIC_API_ORIGIN).toString();
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Fixture sync failed for ${fixture.id}: ${response.status}`);
    }

    const payload = await response.json();
    await writeJson(getFixturePath(fixture.fileName), payload);

    manifest.fixtures.push({
      id: fixture.id,
      endpoint: fixture.endpoint,
      fileName: fixture.fileName,
      count: pickCollectionCount(payload, fixture.countPath),
    });

    console.log(`synced ${fixture.id} -> ${fixture.fileName}`);
  }

  const productsFixture = await readJson(getFixturePath("products-show.json"));
  const products = Array.isArray(productsFixture?.products) ? productsFixture.products : [];
  const guestOrder = createGuestOrder(products);

  await writeJson(ORDER_LOOKUP_FIXTURE_PATH, {
    success: true,
    data: {
      order: guestOrder,
      invoice: guestOrder.invoice,
      email: guestOrder.guestEmail,
    },
  });

  await writeJson(ORDER_VIEW_FIXTURE_PATH, {
    success: true,
    data: {
      token: "fixture-view-token",
      order: guestOrder,
    },
  });

  manifest.fixtures.push({
    id: "order-lookup",
    fileName: "integration/order-lookup.json",
    count: guestOrder.cart.length,
  });
  manifest.fixtures.push({
    id: "order-view",
    fileName: "integration/order-view.json",
    count: guestOrder.cart.length,
  });

  await writeJson(FIXTURE_MANIFEST_PATH, manifest);
  console.log(`fixture manifest updated: ${FIXTURE_MANIFEST_PATH}`);
}

syncFixtures().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

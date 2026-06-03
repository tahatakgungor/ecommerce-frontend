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
      createdAt: new Date(Date.now() - index * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - index * 3600000).toISOString(),
    };
  });
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

  await writeJson(ADMIN_ME_FIXTURE_PATH, adminMe);

  await writeJson(FIXTURE_MANIFEST_PATH, {
    generatedAt: new Date().toISOString(),
    source: "storefront-product-fixtures",
    products: adminProducts.length,
    reviews: adminReviews.length,
  });

  console.log(`synced admin products -> ${PRODUCTS_FIXTURE_PATH}`);
  console.log(`synced admin reviews -> ${REVIEWS_FIXTURE_PATH}`);
  console.log(`synced admin me -> ${ADMIN_ME_FIXTURE_PATH}`);
}

syncAdminFixtures().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

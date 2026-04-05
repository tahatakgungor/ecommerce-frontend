import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeText } from "./lib/humat-import-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../..");

const API_BASE_URL =
  process.env.API_BASE_URL || "https://ecommerce-platform-production-a905.up.railway.app";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const HUMAT_IMAGE_DIR = process.env.HUMAT_IMAGE_DIR || path.resolve(ROOT, "humat");
const APPLY = String(process.env.APPLY || "false").toLowerCase() === "true";
const MATCH_THRESHOLD = Number(process.env.MATCH_THRESHOLD || "0.3");

async function request(method, url, { token, body, multipart } = {}) {
  const headers = {};
  if (!multipart) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: multipart ? body : body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

async function adminLogin() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL ve ADMIN_PASSWORD gerekli.");
  }
  const res = await request("POST", `${API_BASE_URL}/api/admin/login`, {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  if (!res.ok) {
    throw new Error(`Admin login başarısız (${res.status}): ${JSON.stringify(res.json)}`);
  }
  return res.json?.data?.token ?? res.json?.token;
}

async function listProducts(token) {
  const res = await request("GET", `${API_BASE_URL}/api/products/all`, { token });
  if (!res.ok) throw new Error(`Ürünler alınamadı: ${res.status}`);
  return res.json?.data ?? [];
}

async function listImageFiles() {
  const entries = await fs.readdir(HUMAT_IMAGE_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(e.name))
    .map((e) => path.join(HUMAT_IMAGE_DIR, e.name))
    .sort((a, b) => a.localeCompare(b, "tr"));
}

function buildAssignments(products, imageFiles) {
  const catalog = products.map((p) => ({
    id: p?.id || p?._id,
    name: p?.name || p?.title || "",
    originalImage: p?.image || "",
    normName: normalizeText(p?.name || p?.title || ""),
  }));

  const imageNorm = imageFiles.map((imagePath) => ({
    imagePath,
    normImage: normalizeText(path.basename(imagePath, path.extname(imagePath))),
  }));

  const score = (a, b) => {
    if (!a || !b) return 0;
    if (a === b) return 1;
    if (a.includes(b) || b.includes(a)) return 0.85;

    const aTokens = new Set(a.split(" ").filter((t) => t.length > 1));
    const bTokens = new Set(b.split(" ").filter((t) => t.length > 1));
    if (aTokens.size === 0 || bTokens.size === 0) return 0;
    let overlap = 0;
    for (const t of aTokens) if (bTokens.has(t)) overlap += 1;
    return overlap / Math.max(aTokens.size, bTokens.size);
  };

  const assignments = [];
  const usedImages = new Set();
  for (const product of catalog) {
    let best = null;
    for (const image of imageNorm) {
      if (usedImages.has(image.imagePath)) continue;
      const s = score(product.normName, image.normImage);
      if (!best || s > best.score) {
        best = { imagePath: image.imagePath, productId: product.id, productName: product.name, score: s };
      }
    }
    if (best && best.score >= MATCH_THRESHOLD) {
      assignments.push(best);
      usedImages.add(best.imagePath);
    }
  }

  return assignments.sort((a, b) => b.score - a.score);
}

async function uploadImage(token, imagePath) {
  const buffer = await fs.readFile(imagePath);
  const form = new FormData();
  form.set("image", new Blob([buffer]), path.basename(imagePath));
  const res = await request("POST", `${API_BASE_URL}/api/cloudinary/add-img`, {
    token,
    body: form,
    multipart: true,
  });
  if (!res.ok) {
    throw new Error(`Upload başarısız (${imagePath}): ${JSON.stringify(res.json)}`);
  }
  const raw = res.json?.data?.url || res.json?.data?.id || null;
  if (typeof raw === "string" && raw.startsWith("http://") && raw.includes(".railway.app/")) {
    return raw.replace(/^http:\/\//, "https://");
  }
  return raw;
}

async function updateProductImage(token, productId, imageUrl) {
  const payload = { image: imageUrl, relatedImages: [imageUrl] };
  const res = await request("PUT", `${API_BASE_URL}/api/products/update/${productId}`, {
    token,
    body: payload,
  });
  if (!res.ok) {
    throw new Error(`Ürün güncellenemedi (${productId}): ${JSON.stringify(res.json)}`);
  }
}

async function main() {
  const token = await adminLogin();
  const products = await listProducts(token);
  const images = await listImageFiles();
  const assignments = buildAssignments(products, images);

  const report = {
    mode: APPLY ? "APPLY" : "DRY_RUN",
    totalProducts: products.length,
    totalImages: images.length,
    matched: assignments.length,
    unmatchedProducts: products.length - assignments.length,
    updates: [],
  };

  for (const item of assignments) {
    const normalizedName = normalizeText(item.productName);
    const imageFile = path.basename(item.imagePath);
    if (!APPLY) {
      report.updates.push({
        productId: item.productId,
        productName: item.productName,
        imageFile,
        score: Number(item.score.toFixed(3)),
        status: "planned",
      });
      continue;
    }

    const imageUrl = await uploadImage(token, item.imagePath);
    await updateProductImage(token, item.productId, imageUrl);
    report.updates.push({
      productId: item.productId,
      productName: item.productName,
      normalizedName,
      imageFile,
      score: Number(item.score.toFixed(3)),
      imageUrl,
      status: "updated",
    });
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const out = path.resolve(__dirname, `../data/restore-product-images-report-${stamp}.json`);
  await fs.writeFile(out, JSON.stringify(report, null, 2), "utf8");

  console.log(JSON.stringify({ summary: report, reportPath: out }, null, 2));
}

main().catch((err) => {
  console.error("Image restore script başarısız:", err);
  process.exitCode = 1;
});

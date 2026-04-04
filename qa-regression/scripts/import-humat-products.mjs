import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  bestMatchForImage,
  inferBrandFromName,
  normalizeText,
  toSlugSku,
} from "./lib/humat-import-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../..");

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8081";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const HUMAT_IMAGE_DIR = process.env.HUMAT_IMAGE_DIR || path.resolve(ROOT, "humat");
const OUTPUT_JSON = process.env.OUTPUT_JSON || path.resolve(__dirname, "../data/humat-product-import-plan.json");
const IMPORT = String(process.env.IMPORT || "false").toLowerCase() === "true";
const MATCH_THRESHOLD = Number(process.env.MATCH_THRESHOLD || "0.34");

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

function stripHtml(html = "") {
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePriceToNumber(priceRaw) {
  if (priceRaw == null) return null;
  const cleaned = String(priceRaw)
    .replace(/[^\d,\.]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(/,/g, ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

async function fetchSerravitProducts() {
  const all = [];
  for (let page = 1; page <= 8; page += 1) {
    const url = `https://serravit.com.tr/wp-json/wc/store/v1/products?per_page=100&page=${page}`;
    const res = await request("GET", url);
    if (!res.ok || !Array.isArray(res.json) || res.json.length === 0) break;

    for (const p of res.json) {
      const priceMinor = Number(p?.prices?.price ?? 0);
      const currencyMinorUnit = Number(p?.prices?.currency_minor_unit ?? 2);
      const price = priceMinor > 0 ? priceMinor / Math.pow(10, currencyMinorUnit) : null;

      all.push({
        source: "serravit",
        sourceUrl: p?.permalink || null,
        name: p?.name?.trim(),
        category: p?.categories?.[0]?.name || "Genel",
        description: stripHtml(p?.short_description || p?.description || ""),
        price,
      });
    }
  }

  return all.filter((p) => p.name && p.price != null);
}

async function fetchHumatProductUrls() {
  const sitemapRes = await request("GET", "https://www.humat.com.tr/sitemap.xml");
  if (!sitemapRes.ok || !sitemapRes.json?.raw) {
    throw new Error("Humat sitemap okunamadı");
  }
  const xml = sitemapRes.json.raw;
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  const productUrls = new Set(matches.filter((u) => /pro_\d+\.html/i.test(u)));
  const categoryUrls = matches.filter((u) => /cat\d+\.html/i.test(u));

  for (const categoryUrl of categoryUrls) {
    const categoryRes = await request("GET", categoryUrl);
    if (!categoryRes.ok || !categoryRes.json?.raw) continue;
    const html = categoryRes.json.raw;
    const links = [...html.matchAll(/href="([^"]*pro_\d+\.html[^"]*)"/gi)].map((m) => m[1]);
    for (const rawLink of links) {
      const absolute = rawLink.startsWith("http")
        ? rawLink
        : new URL(rawLink.replace(/&amp;/g, "&"), "https://www.humat.com.tr").toString();
      productUrls.add(absolute);
    }
  }

  return [...productUrls];
}

async function fetchHumatProduct(url) {
  const res = await request("GET", url);
  if (!res.ok || !res.json?.raw) return null;
  const html = res.json.raw;

  const nameMatch = html.match(/<h1[^>]*class="product-name"[^>]*>(.*?)<\/h1>/is);
  const priceMatch = html.match(/itemprop="price"[^>]*class="item-price"[^>]*>(.*?)<\/span>/is);
  const crumbMatches = [...html.matchAll(/<a[^>]*href="[^"]*cat\d+\.html"[^>]*>(.*?)<\/a>/gis)].map((m) => stripHtml(m[1]));

  const name = stripHtml(nameMatch?.[1] || "");
  const price = parsePriceToNumber(stripHtml(priceMatch?.[1] || ""));
  const category = crumbMatches.length > 0 ? crumbMatches[crumbMatches.length - 1] : "Genel";

  if (!name || price == null) return null;
  return {
    source: "humat",
    sourceUrl: url,
    name,
    category,
    description: "",
    price,
  };
}

async function fetchHumatProducts() {
  const urls = await fetchHumatProductUrls();
  const products = [];
  for (const url of urls) {
    const p = await fetchHumatProduct(url);
    if (p) products.push(p);
  }

  const seen = new Set();
  return products.filter((p) => {
    const key = `${normalizeText(p.name)}|${p.price}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function listImageFiles() {
  const entries = await fs.readdir(HUMAT_IMAGE_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(e.name))
    .map((e) => path.join(HUMAT_IMAGE_DIR, e.name))
    .sort((a, b) => a.localeCompare(b, "tr"));
}

function buildImportRows(images, products) {
  const rows = [];
  const unmatched = [];

  for (let i = 0; i < images.length; i += 1) {
    const imagePath = images[i];
    const best = bestMatchForImage(imagePath, products, MATCH_THRESHOLD);
    if (!best) {
      unmatched.push({ imagePath, reason: "No candidate above threshold" });
      continue;
    }

    const product = best.product;
    rows.push({
      title: product.name,
      source: product.source,
      sourceUrl: product.sourceUrl,
      category: product.category || "Genel",
      price: Number(product.price),
      originalPrice: Number((Number(product.price) * 1.15).toFixed(2)),
      description: product.description || `${product.name} için otomatik ürün açıklaması.`,
      imagePath,
      score: Number(best.score.toFixed(3)),
      brand: inferBrandFromName(product.name),
      sku: toSlugSku(product.name, i),
      quantity: 200,
      tags: [
        inferBrandFromName(product.name).toLowerCase(),
        normalizeText(product.category || "genel").replace(/\s+/g, "-"),
      ],
      status: "Active",
    });
  }

  return {
    rows: rows.sort((a, b) => a.title.localeCompare(b.title, "tr")),
    unmatched,
  };
}

async function adminLogin() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("IMPORT=true için ADMIN_EMAIL ve ADMIN_PASSWORD gerekli");
  }
  const res = await request("POST", `${API_BASE_URL}/api/admin/login`, {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  if (!res.ok) {
    throw new Error(`Admin login başarısız (${res.status}): ${JSON.stringify(res.json)}`);
  }
  return res.json?.data?.token ?? res.json?.token;
}

async function ensureCategory(token, name) {
  const list = await request("GET", `${API_BASE_URL}/api/category/all`, { token });
  const found = (list.json?.data ?? []).find((c) => normalizeText(c?.name || c?.parent) === normalizeText(name));
  if (found) return found.name || found.parent;

  const create = await request("POST", `${API_BASE_URL}/api/category/add`, {
    token,
    body: {
      parent: name,
      description: `Otomatik kategori: ${name}`,
      image: "",
      children: [],
    },
  });
  if (!create.ok) {
    throw new Error(`Kategori oluşturulamadı (${name}): ${JSON.stringify(create.json)}`);
  }
  return create.json?.data?.name || name;
}

async function ensureBrand(token, name) {
  const list = await request("GET", `${API_BASE_URL}/api/brand/all`, { token });
  const found = (list.json?.data ?? []).find((b) => normalizeText(b?.name) === normalizeText(name));
  if (found) return found.name;

  const create = await request("POST", `${API_BASE_URL}/api/brand/add`, {
    token,
    body: {
      name,
      description: `Otomatik marka: ${name}`,
      email: "info@example.com",
      website: "https://example.com",
      location: "TR",
      logo: "",
      status: "Active",
    },
  });
  if (!create.ok) {
    throw new Error(`Marka oluşturulamadı (${name}): ${JSON.stringify(create.json)}`);
  }
  return create.json?.data?.name || name;
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
    throw new Error(`Görsel upload başarısız (${imagePath}): ${JSON.stringify(res.json)}`);
  }
  const rawUrl = res.json?.data?.url || res.json?.data?.id || null;
  if (typeof rawUrl === "string" && rawUrl.startsWith("http://") && rawUrl.includes(".railway.app/")) {
    return rawUrl.replace(/^http:\/\//, "https://");
  }
  return rawUrl;
}

async function existingProductNames(token) {
  const res = await request("GET", `${API_BASE_URL}/api/products/all`, { token });
  const names = new Set();
  for (const p of res.json?.data ?? []) {
    if (p?.name) names.add(normalizeText(p.name));
    if (p?.title) names.add(normalizeText(p.title));
  }
  return names;
}

async function createProduct(token, row, imageUrl) {
  const body = {
    title: row.title,
    sku: row.sku,
    parent: row.category,
    children: row.category,
    tags: row.tags,
    image: imageUrl,
    originalPrice: row.originalPrice,
    price: row.price,
    relatedImages: [],
    description: row.description,
    brand: { name: row.brand },
    category: { name: row.category },
    quantity: row.quantity,
    colors: [],
    status: row.status,
  };

  const res = await request("POST", `${API_BASE_URL}/api/products/add`, {
    token,
    body,
  });
  if (!res.ok) {
    throw new Error(`Ürün ekleme başarısız (${row.title}): ${JSON.stringify(res.json)}`);
  }
  return res.json?.data;
}

async function runImport(rows) {
  const token = await adminLogin();
  const existing = await existingProductNames(token);

  const result = { created: [], skipped: [], failed: [] };

  for (const row of rows) {
    try {
      if (existing.has(normalizeText(row.title))) {
        result.skipped.push({ title: row.title, reason: "already exists" });
        continue;
      }

      const category = await ensureCategory(token, row.category);
      const brand = await ensureBrand(token, row.brand);
      const imageUrl = await uploadImage(token, row.imagePath);
      const created = await createProduct(token, { ...row, category, brand }, imageUrl);

      result.created.push({
        title: row.title,
        price: row.price,
        category,
        brand,
        imageUrl,
        id: created?.id || created?._id || null,
      });
    } catch (error) {
      result.failed.push({ title: row.title, error: error.message });
    }
  }

  return result;
}

async function main() {
  console.log("[1/4] Kaynak sitelerden ürünler çekiliyor...");
  const [serravit, humat] = await Promise.all([fetchSerravitProducts(), fetchHumatProducts()]);
  const allProducts = [...serravit, ...humat];

  console.log(`[2/4] Toplam kaynak ürün: ${allProducts.length} (serravit=${serravit.length}, humat=${humat.length})`);

  const images = await listImageFiles();
  const { rows, unmatched } = buildImportRows(images, allProducts);

  const plan = {
    generatedAt: new Date().toISOString(),
    importMode: IMPORT,
    imageDir: HUMAT_IMAGE_DIR,
    stats: {
      imageCount: images.length,
      matchedCount: rows.length,
      unmatchedCount: unmatched.length,
      sourceProducts: allProducts.length,
    },
    rows,
    unmatched,
  };

  await fs.mkdir(path.dirname(OUTPUT_JSON), { recursive: true });
  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(plan, null, 2)}\n`, "utf8");

  console.log(`[3/4] Plan dosyası yazıldı: ${OUTPUT_JSON}`);
  console.log(`      Eşleşen: ${rows.length}, Eşleşmeyen: ${unmatched.length}`);

  if (!IMPORT) {
    console.log("[4/4] Dry-run tamamlandı. Gerçek import için IMPORT=true ile tekrar çalıştır.");
    return;
  }

  console.log("[4/4] API import başlıyor...");
  const importResult = await runImport(rows);
  const importReportPath = OUTPUT_JSON.replace(/\.json$/i, ".import-result.json");
  await fs.writeFile(importReportPath, `${JSON.stringify(importResult, null, 2)}\n`, "utf8");

  console.log(`Import tamamlandı. created=${importResult.created.length}, skipped=${importResult.skipped.length}, failed=${importResult.failed.length}`);
  console.log(`Rapor: ${importReportPath}`);
}

main().catch((error) => {
  console.error("Import script hata:", error);
  process.exitCode = 1;
});

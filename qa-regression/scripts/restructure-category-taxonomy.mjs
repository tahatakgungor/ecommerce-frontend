import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeText } from "./lib/humat-import-utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL =
  process.env.API_BASE_URL || "https://ecommerce-platform-production-a905.up.railway.app";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const APPLY = String(process.env.APPLY || "false").toLowerCase() === "true";

const SNAPSHOT_DIR = path.resolve(__dirname, "../data");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

const TARGET_TAXONOMY = [
  {
    name: "Sağlık",
    description: "Sağlık ana kategorisi",
    children: ["Gıda Takviyesi", "Kozmetik"],
  },
  {
    name: "Tarım",
    description: "Tarım ana kategorisi",
    children: ["Gübre", "Diğer"],
  },
];

const toNorm = (value) => normalizeText(value || "");

const MAP_TO_KOZMETIK = new Set(["cilt bakimi", "sac bakimi", "detoks", "cilt bak m", "sac bak m"]);
const MAP_TO_DIGER = new Set([
  "biyogaz",
  "cimento beton",
  "akvaryum",
  "hayvan sagligi",
  "cevre atik aritma sistemleri",
  "cevre",
  "buhar kazani besi suyu sartlandiricisi",
  "genel",
  "",
]);

function compact(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function safeCategoryName(product) {
  return compact(product?.category?.name || product?.categoryName || product?.children || product?.parent);
}

function safeParent(product) {
  return compact(product?.parent || product?.parentCategory);
}

function safeChildren(product) {
  return compact(product?.children || product?.childCategory);
}

function inferTargetCategory(product) {
  const raw = safeCategoryName(product);
  const parent = safeParent(product);
  const child = safeChildren(product);
  const normalizedCandidates = [raw, child, parent]
    .map((v) => toNorm(v))
    .filter(Boolean);

  for (const norm of normalizedCandidates) {
    if (norm === "gida takviyesi") return { parent: "Sağlık", child: "Gıda Takviyesi", reason: "direct-gida" };
    if (norm === "kozmetik") return { parent: "Sağlık", child: "Kozmetik", reason: "direct-kozmetik" };
    if (norm === "gubre") return { parent: "Tarım", child: "Gübre", reason: "direct-gubre" };
    if (norm === "diger") return { parent: "Tarım", child: "Diğer", reason: "direct-diger" };
    if (MAP_TO_KOZMETIK.has(norm)) return { parent: "Sağlık", child: "Kozmetik", reason: `legacy-kozmetik:${norm}` };
    if (MAP_TO_DIGER.has(norm)) return { parent: "Tarım", child: "Diğer", reason: `legacy-diger:${norm || "empty"}` };
  }

  if (normalizedCandidates.some((norm) => norm.includes("gubre"))) {
    return { parent: "Tarım", child: "Gübre", reason: "contains-gubre" };
  }
  if (normalizedCandidates.some((norm) => norm.includes("takviye"))) {
    return { parent: "Sağlık", child: "Gıda Takviyesi", reason: "contains-takviye" };
  }
  if (normalizedCandidates.some((norm) => norm.includes("kozmetik") || norm.includes("bakim") || norm.includes("detoks"))) {
    return { parent: "Sağlık", child: "Kozmetik", reason: "contains-kozmetik" };
  }

  return { parent: "Tarım", child: "Diğer", reason: "fallback-diger" };
}

async function request(method, url, { token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
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

  const token = res.json?.data?.token ?? res.json?.token;
  if (!token) throw new Error("Login başarılı ama token dönmedi.");
  return token;
}

async function getCategories(token) {
  const res = await request("GET", `${API_BASE_URL}/api/category/all`, { token });
  if (!res.ok) {
    throw new Error(`Kategori listesi alınamadı (${res.status}): ${JSON.stringify(res.json)}`);
  }
  return Array.isArray(res.json?.data) ? res.json.data : [];
}

async function getProducts(token) {
  const res = await request("GET", `${API_BASE_URL}/api/products/all`, { token });
  if (!res.ok) {
    throw new Error(`Ürün listesi alınamadı (${res.status}): ${JSON.stringify(res.json)}`);
  }
  return Array.isArray(res.json?.data) ? res.json.data : [];
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function upsertTargetTaxonomy(token, categories) {
  const actions = [];
  const keeperIds = new Set();
  const idsToDelete = new Set();

  for (const target of TARGET_TAXONOMY) {
    const matched = categories.filter((c) => toNorm(c?.name || c?.parent) === toNorm(target.name));
    let keeper = matched[0] || null;

    if (!keeper && APPLY) {
      const created = await request("POST", `${API_BASE_URL}/api/category/add`, {
        token,
        body: {
          parent: target.name,
          description: target.description,
          image: "",
          children: target.children,
        },
      });
      if (!created.ok) {
        throw new Error(`Kategori oluşturulamadı (${target.name}): ${JSON.stringify(created.json)}`);
      }
      keeper = created.json?.data || null;
      actions.push({ type: "create-category", target: target.name, status: created.status });
    } else if (!keeper) {
      actions.push({ type: "create-category", target: target.name, status: "planned" });
    }

    if (keeper?.id) keeperIds.add(keeper.id);
    if (keeper) {
      const updatePayload = {
        parent: target.name,
        description: keeper.description || target.description,
        image: keeper.image || "",
        children: target.children,
      };
      if (APPLY) {
        const updated = await request("PUT", `${API_BASE_URL}/api/category/update/${keeper.id}`, {
          token,
          body: updatePayload,
        });
        if (!updated.ok) {
          throw new Error(`Kategori güncellenemedi (${target.name}): ${JSON.stringify(updated.json)}`);
        }
        actions.push({ type: "update-category", id: keeper.id, target: target.name, status: updated.status });
      } else {
        actions.push({ type: "update-category", id: keeper.id, target: target.name, status: "planned", payload: updatePayload });
      }
    }

    for (const duplicate of matched.slice(1)) {
      if (duplicate?.id) idsToDelete.add(duplicate.id);
    }
  }

  for (const category of categories) {
    const name = category?.name || category?.parent;
    const isTarget = TARGET_TAXONOMY.some((t) => toNorm(t.name) === toNorm(name));
    if (!isTarget && category?.id) idsToDelete.add(category.id);
  }

  return { actions, keeperIds, idsToDelete: [...idsToDelete] };
}

function buildProductNormalizationPlan(products) {
  return products.map((p) => {
    const target = inferTargetCategory(p);
    const currentParent = safeParent(p);
    const currentCategory = safeCategoryName(p);
    const currentChildren = safeChildren(p);
    const changed =
      toNorm(currentParent) !== toNorm(target.parent) ||
      toNorm(currentCategory) !== toNorm(target.child) ||
      toNorm(currentChildren) !== toNorm(target.child);

    return {
      id: p?.id || p?._id,
      title: p?.name || p?.title || "",
      currentParent,
      currentCategory,
      currentChildren,
      targetParent: target.parent,
      targetCategory: target.child,
      targetChildren: target.child,
      reason: target.reason,
      changed,
    };
  });
}

async function applyProductNormalization(token, planRows) {
  const result = { updated: 0, skipped: 0, failed: [] };
  for (const row of planRows) {
    if (!row.id) {
      result.skipped += 1;
      continue;
    }
    if (!row.changed) {
      result.skipped += 1;
      continue;
    }

    if (!APPLY) {
      result.updated += 1;
      continue;
    }

    const payload = {
      parent: row.targetParent,
      category: { name: row.targetCategory },
      children: row.targetChildren,
    };

    const res = await request("PUT", `${API_BASE_URL}/api/products/update/${row.id}`, {
      token,
      body: payload,
    });
    if (!res.ok) {
      result.failed.push({
        id: row.id,
        title: row.title,
        status: res.status,
        response: res.json,
      });
      continue;
    }
    result.updated += 1;
  }
  return result;
}

async function cleanupOldCategories(token, idsToDelete) {
  const outcome = [];
  for (const id of idsToDelete) {
    if (!APPLY) {
      outcome.push({ id, deleted: false, status: "planned" });
      continue;
    }
    const res = await request("DELETE", `${API_BASE_URL}/api/category/delete/${id}`, { token });
    outcome.push({ id, deleted: res.ok, status: res.status, response: res.ok ? undefined : res.json });
  }
  return outcome;
}

function validateTaxonomy(categories, products) {
  const categoryErrors = [];
  const productErrors = [];

  const expected = {
    saglik: ["gida takviyesi", "kozmetik"],
    tarim: ["gubre", "diger"],
  };

  const byName = new Map(categories.map((c) => [toNorm(c?.name || c?.parent), c]));
  const saglik = byName.get("saglik");
  const tarim = byName.get("tarim");

  if (!saglik) categoryErrors.push("Sağlık kategorisi yok.");
  if (!tarim) categoryErrors.push("Tarım kategorisi yok.");
  if (categories.length !== 2) categoryErrors.push(`Kategori sayısı 2 değil: ${categories.length}`);

  if (saglik) {
    const childNorm = (saglik.children || []).map(toNorm).sort();
    const expectedNorm = [...expected.saglik].sort();
    if (JSON.stringify(childNorm) !== JSON.stringify(expectedNorm)) {
      categoryErrors.push(`Sağlık children uyumsuz: ${JSON.stringify(saglik.children || [])}`);
    }
  }

  if (tarim) {
    const childNorm = (tarim.children || []).map(toNorm).sort();
    const expectedNorm = [...expected.tarim].sort();
    if (JSON.stringify(childNorm) !== JSON.stringify(expectedNorm)) {
      categoryErrors.push(`Tarım children uyumsuz: ${JSON.stringify(tarim.children || [])}`);
    }
  }

  const validParents = new Set(["saglik", "tarim"]);
  const validChildren = new Set(["gida takviyesi", "kozmetik", "gubre", "diger"]);

  for (const p of products) {
    const parentNorm = toNorm(safeParent(p));
    const categoryNorm = toNorm(safeCategoryName(p));
    const childNorm = toNorm(safeChildren(p));
    const id = p?.id || p?._id;
    const title = p?.name || p?.title || "";

    if (!validParents.has(parentNorm)) {
      productErrors.push({ id, title, issue: `parent geçersiz: ${safeParent(p)}` });
    }
    if (!validChildren.has(categoryNorm)) {
      productErrors.push({ id, title, issue: `category.name geçersiz: ${safeCategoryName(p)}` });
    }
    if (!childNorm) {
      productErrors.push({ id, title, issue: "children boş" });
    } else if (childNorm !== categoryNorm) {
      productErrors.push({ id, title, issue: `children/category uyuşmuyor (${safeChildren(p)} != ${safeCategoryName(p)})` });
    }
  }

  return { categoryErrors, productErrors };
}

async function main() {
  const token = await adminLogin();
  const beforeCategories = await getCategories(token);
  const beforeProducts = await getProducts(token);

  const snapshot = {
    createdAt: new Date().toISOString(),
    apiBaseUrl: API_BASE_URL,
    applyMode: APPLY,
    categories: beforeCategories,
    products: beforeProducts.map((p) => ({
      id: p?.id || p?._id,
      title: p?.name || p?.title || "",
      parent: safeParent(p),
      category: safeCategoryName(p),
      children: safeChildren(p),
    })),
  };

  const snapshotFile = path.join(SNAPSHOT_DIR, `category-taxonomy-snapshot-${timestamp}.json`);
  const latestSnapshotFile = path.join(SNAPSHOT_DIR, "category-taxonomy-snapshot.latest.json");
  await writeJson(snapshotFile, snapshot);
  await writeJson(latestSnapshotFile, snapshot);

  const taxonomyOps = await upsertTargetTaxonomy(token, beforeCategories);
  const normalizationPlan = buildProductNormalizationPlan(beforeProducts);
  const normalizationResult = await applyProductNormalization(token, normalizationPlan);
  const cleanupResult = await cleanupOldCategories(token, taxonomyOps.idsToDelete);

  const afterCategories = APPLY ? await getCategories(token) : beforeCategories;
  const afterProducts = APPLY ? await getProducts(token) : beforeProducts;
  const validation = validateTaxonomy(afterCategories, afterProducts);

  const report = {
    createdAt: new Date().toISOString(),
    applyMode: APPLY,
    apiBaseUrl: API_BASE_URL,
    snapshotFile,
    summary: {
      totalCategoriesBefore: beforeCategories.length,
      totalProductsBefore: beforeProducts.length,
      plannedCategoryActions: taxonomyOps.actions.length,
      plannedProductUpdates: normalizationPlan.filter((r) => r.changed).length,
      productUpdatesAppliedOrPlanned: normalizationResult.updated,
      productUpdatesSkipped: normalizationResult.skipped,
      productUpdateFailures: normalizationResult.failed.length,
      categoryDeletesPlanned: cleanupResult.length,
    },
    taxonomyActions: taxonomyOps.actions,
    categoryCleanup: cleanupResult,
    productNormalization: {
      failures: normalizationResult.failed,
      samples: normalizationPlan.slice(0, 30),
    },
    validation,
  };

  const reportFile = path.join(SNAPSHOT_DIR, `category-taxonomy-report-${timestamp}.json`);
  const latestReportFile = path.join(SNAPSHOT_DIR, "category-taxonomy-report.latest.json");
  await writeJson(reportFile, report);
  await writeJson(latestReportFile, report);

  console.log("Taxonomy script tamamlandı.");
  console.log(`Mode: ${APPLY ? "APPLY" : "DRY_RUN"}`);
  console.log(`Snapshot: ${snapshotFile}`);
  console.log(`Report:   ${reportFile}`);
  console.log(
    JSON.stringify(
      {
        summary: report.summary,
        validation: {
          categoryErrors: validation.categoryErrors.length,
          productErrors: validation.productErrors.length,
        },
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error("Taxonomy script başarısız:", err);
  process.exitCode = 1;
});

import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const FRONTEND_ROOT = path.resolve(__dirname, "..", "..");
export const TEST_ENV_ROOT = path.resolve(__dirname);
export const FIXTURE_ROOT = path.join(TEST_ENV_ROOT, "fixtures", "public-api");
export const FIXTURE_MANIFEST_PATH = path.join(FIXTURE_ROOT, "manifest.json");
export const INTEGRATION_FIXTURE_ROOT = path.join(TEST_ENV_ROOT, "fixtures", "integration");
export const ORDER_LOOKUP_FIXTURE_PATH = path.join(INTEGRATION_FIXTURE_ROOT, "order-lookup.json");
export const ORDER_VIEW_FIXTURE_PATH = path.join(INTEGRATION_FIXTURE_ROOT, "order-view.json");

export const TEST_ENV_API_PORT = Number(process.env.TEST_ENV_API_PORT || 8081);
export const TEST_ENV_FRONTEND_PORT = Number(process.env.TEST_ENV_FRONTEND_PORT || 3002);
export const TEST_ENV_FRONTEND_ORIGIN =
  process.env.TEST_ENV_FRONTEND_ORIGIN || `http://localhost:${TEST_ENV_FRONTEND_PORT}`;
export const TEST_ENV_API_ORIGIN =
  process.env.TEST_ENV_API_ORIGIN || `http://localhost:${TEST_ENV_API_PORT}`;
export const LIVE_PUBLIC_API_ORIGIN =
  process.env.TEST_ENV_SOURCE_BASE_URL || "https://api.serravit.com";

export const PUBLIC_FIXTURES = [
  {
    id: "products",
    endpoint: "/api/products/show",
    fileName: "products-show.json",
    countPath: ["products"],
  },
  {
    id: "categories",
    endpoint: "/api/category/show",
    fileName: "category-show.json",
    countPath: ["categories"],
  },
  {
    id: "site-settings",
    endpoint: "/api/site-settings",
    fileName: "site-settings.json",
    countPath: ["settings"],
  },
];

export function getFixturePath(fileName) {
  return path.join(FIXTURE_ROOT, fileName);
}

export async function ensureFixtureDirectory() {
  await fs.mkdir(FIXTURE_ROOT, { recursive: true });
}

export async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function pickCollectionCount(payload, countPath = []) {
  const value = countPath.reduce((acc, key) => (acc && typeof acc === "object" ? acc[key] : undefined), payload);
  if (Array.isArray(value)) {
    return value.length;
  }
  if (value && typeof value === "object") {
    return Object.keys(value).length;
  }
  return 0;
}

export function resolveChromeExecutable() {
  const envPath = process.env.PLAYWRIGHT_CHROME_PATH || process.env.CHROME_PATH;
  if (envPath) return envPath;

  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];

  return candidates.find((candidate) => fsSync.existsSync(candidate));
}

export async function fetchJsonOrThrow(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`);
  }
  return response.json();
}

import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ADMIN_ROOT = path.resolve(__dirname, "..", "..");
export const TEST_ENV_ROOT = __dirname;
export const FIXTURE_ROOT = path.join(TEST_ENV_ROOT, "fixtures");
export const FIXTURE_MANIFEST_PATH = path.join(FIXTURE_ROOT, "manifest.json");
export const STOREFRONT_PRODUCT_FIXTURE = path.resolve(
  ADMIN_ROOT,
  "..",
  "harri-front-end",
  "tests",
  "test-env",
  "fixtures",
  "public-api",
  "products-show.json"
);

export const TEST_ENV_API_PORT = Number(process.env.ADMIN_TEST_ENV_API_PORT || 8082);
export const TEST_ENV_FRONTEND_PORT = Number(process.env.ADMIN_TEST_ENV_FRONTEND_PORT || 3101);
export const TEST_ENV_FRONTEND_ORIGIN =
  process.env.ADMIN_TEST_ENV_FRONTEND_ORIGIN || `http://localhost:${TEST_ENV_FRONTEND_PORT}`;
export const TEST_ENV_API_ORIGIN =
  process.env.ADMIN_TEST_ENV_API_ORIGIN || `http://localhost:${TEST_ENV_API_PORT}`;

export async function ensureFixtureDirectory() {
  await fsPromises.mkdir(FIXTURE_ROOT, { recursive: true });
}

export async function writeJson(filePath, data) {
  await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
  await fsPromises.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function readJson(filePath) {
  return JSON.parse(await fsPromises.readFile(filePath, "utf8"));
}

export async function fileExists(filePath) {
  try {
    await fsPromises.access(filePath);
    return true;
  } catch {
    return false;
  }
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
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

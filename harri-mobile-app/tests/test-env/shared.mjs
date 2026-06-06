import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const MOBILE_ROOT = path.resolve(__dirname, "..", "..");
export const STOREFRONT_ROOT = path.resolve(MOBILE_ROOT, "..", "harri-front-end");
export const STOREFRONT_TEST_ENV_ROOT = path.join(STOREFRONT_ROOT, "tests", "test-env");
export const STOREFRONT_FIXTURE_ROOT = path.join(STOREFRONT_TEST_ENV_ROOT, "fixtures", "public-api");
export const STOREFRONT_FIXTURE_MANIFEST_PATH = path.join(STOREFRONT_FIXTURE_ROOT, "manifest.json");
export const ORDER_LOOKUP_FIXTURE_PATH = path.join(STOREFRONT_TEST_ENV_ROOT, "fixtures", "integration", "order-lookup.json");
export const PRODUCTS_FIXTURE_PATH = path.join(STOREFRONT_FIXTURE_ROOT, "products-show.json");

export const TEST_ENV_API_PORT = Number(process.env.TEST_ENV_API_PORT || 8081);
export const TEST_ENV_MOBILE_PORT = Number(process.env.TEST_ENV_MOBILE_PORT || 3003);
export const TEST_ENV_MOBILE_ORIGIN =
  process.env.TEST_ENV_MOBILE_ORIGIN || `http://localhost:${TEST_ENV_MOBILE_PORT}`;
export const TEST_ENV_API_ORIGIN =
  process.env.TEST_ENV_API_ORIGIN || `http://localhost:${TEST_ENV_API_PORT}`;

export const TEST_MOBILE_USER = {
  email: "customer+smoke@test.invalid",
  loginCode: "fixture-login-code-mobile-smoke",
  passwordChangeCode: "fixture-password-change-code",
  confirmEmailToken: "fixture-confirm-email-token",
  resetPasswordToken: "fixture-reset-password-token",
  token: "fixture-mobile-access-token",
  name: "Test Musteri",
  firstName: "Test",
  lastName: "Musteri",
  phone: "05550000000",
  address: "Moda Caddesi No 10",
  city: "Istanbul",
  country: "Turkey",
  zipCode: "34710",
  savedAddresses: "",
};

export const TEST_MOBILE_COUPON = {
  couponCode: "SMOKE5",
  title: "Mobile Smoke Coupon",
};

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

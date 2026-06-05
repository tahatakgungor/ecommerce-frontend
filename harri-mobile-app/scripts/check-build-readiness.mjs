import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MOBILE_ROOT = path.resolve(__dirname, "..");
const profile = String(process.argv[2] || "preview").trim();

const profileVariants = {
  preview: "preview",
  "ios-simulator": "preview",
  production: "production",
};

const expectedVariant = profileVariants[profile];

if (!expectedVariant) {
  console.error(`Unsupported build profile: ${profile}`);
  process.exit(1);
}

const apiBaseUrl = String(process.env.EXPO_PUBLIC_API_BASE_URL || "").trim();
if (!apiBaseUrl) {
  console.error("EXPO_PUBLIC_API_BASE_URL is required for build readiness checks.");
  process.exit(1);
}

let parsedApiBaseUrl;
try {
  parsedApiBaseUrl = new URL(apiBaseUrl);
} catch {
  console.error("EXPO_PUBLIC_API_BASE_URL must be a valid absolute URL.");
  process.exit(1);
}

const allowHttpHosts = new Set(["localhost", "127.0.0.1", "10.0.2.2"]);
if (profile !== "preview" && parsedApiBaseUrl.protocol !== "https:") {
  console.error("Non-preview builds must use an https API base URL.");
  process.exit(1);
}

if (parsedApiBaseUrl.protocol !== "https:" && !allowHttpHosts.has(parsedApiBaseUrl.hostname)) {
  console.error("HTTP API base URL is only allowed for localhost / emulator smoke.");
  process.exit(1);
}

const env = {
  ...process.env,
  APP_VARIANT: expectedVariant,
  EXPO_PUBLIC_APP_ENV: expectedVariant,
};

const configOutput = execFileSync("npx", ["expo", "config", "--json"], {
  cwd: MOBILE_ROOT,
  encoding: "utf8",
  env,
});

const config = JSON.parse(configOutput);
const expoConfig = config.expo || config || {};
const androidPackage = String(expoConfig.android?.package || "").trim();
const iosBundleIdentifier = String(expoConfig.ios?.bundleIdentifier || "").trim();
const scheme = Array.isArray(expoConfig.scheme) ? expoConfig.scheme[0] : expoConfig.scheme;
const variant = String(expoConfig.extra?.appVariant || "").trim();

if (!androidPackage || !iosBundleIdentifier) {
  console.error("Android package and iOS bundle identifier must both resolve in Expo config.");
  process.exit(1);
}

if (!scheme || scheme !== "serravitmobile") {
  console.error("Expected Expo scheme serravitmobile.");
  process.exit(1);
}

if (variant !== expectedVariant) {
  console.error(`Resolved appVariant ${variant || "<empty>"} does not match expected ${expectedVariant}.`);
  process.exit(1);
}

const expectedSuffix = expectedVariant === "preview" ? ".preview" : "";
if (expectedSuffix && (!androidPackage.endsWith(expectedSuffix) || !iosBundleIdentifier.endsWith(expectedSuffix))) {
  console.error(`Preview builds must use ${expectedSuffix} package/bundle suffixes.`);
  process.exit(1);
}

if (!expectedSuffix && (androidPackage.endsWith(".preview") || iosBundleIdentifier.endsWith(".preview"))) {
  console.error("Production build must not use preview identifiers.");
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      profile,
      variant,
      apiBaseUrl,
      scheme,
      androidPackage,
      iosBundleIdentifier,
    },
    null,
    2
  )
);

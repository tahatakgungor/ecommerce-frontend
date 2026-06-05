import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MOBILE_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(MOBILE_ROOT, "..");
const profile = String(process.argv[2] || "preview").trim();

if (!["preview", "production"].includes(profile)) {
  console.error(`Unsupported release gate profile: ${profile}`);
  process.exit(1);
}

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command, args, cwd, extraEnv = {}) {
  console.log(`\n> ${[command, ...args].join(" ")}`);
  execFileSync(command, args, {
    cwd,
    stdio: "inherit",
    env: {
      ...process.env,
      ...extraEnv,
    },
  });
}

run("node", ["./ops/security/check-staged-secrets.mjs"], REPO_ROOT);

if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
  console.error("EXPO_PUBLIC_API_BASE_URL is required.");
  process.exit(1);
}

run(npmCommand, ["run", profile === "preview" ? "preflight:preview" : "preflight:production"], MOBILE_ROOT);
run("npx", ["tsc", "--noEmit"], MOBILE_ROOT);
run(npmCommand, ["run", "test:ci"], MOBILE_ROOT);
run("npx", ["expo", "export", "--platform", "web"], MOBILE_ROOT);
run(npmCommand, ["run", "test:env:verify"], MOBILE_ROOT);

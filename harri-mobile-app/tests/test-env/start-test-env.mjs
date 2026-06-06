import { execFileSync, spawn } from "node:child_process";
import process from "node:process";

import {
  MOBILE_ROOT,
  ORDER_LOOKUP_FIXTURE_PATH,
  STOREFRONT_FIXTURE_MANIFEST_PATH,
  STOREFRONT_ROOT,
  TEST_ENV_API_ORIGIN,
  TEST_ENV_API_PORT,
  TEST_ENV_MOBILE_ORIGIN,
  TEST_ENV_MOBILE_PORT,
  fileExists,
} from "./shared.mjs";

const shouldRunSmoke = process.argv.includes("--smoke");
const shouldRunVisualAudit = process.argv.includes("--visual");
const childProcesses = [];

function spawnProcess(command, args, options = {}) {
  const child = spawn(command, args, {
    env: process.env,
    stdio: "pipe",
    ...options,
  });

  child.stdout?.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr?.on("data", (chunk) => process.stderr.write(chunk));
  childProcesses.push(child);
  return child;
}

function resetPort(port, label) {
  try {
    execFileSync("bash", ["-lc", `lsof -ti tcp:${port} | xargs kill -TERM >/dev/null 2>&1 || true`], {
      stdio: "ignore",
    });
    console.log(`reset ${label} port ${port}`);
  } catch {}
}

async function ensureFixturesReady() {
  const fixturesReady = (await fileExists(STOREFRONT_FIXTURE_MANIFEST_PATH)) && (await fileExists(ORDER_LOOKUP_FIXTURE_PATH));
  if (fixturesReady) {
    return;
  }

  console.log("fixtures missing, syncing storefront public snapshots...");
  await new Promise((resolve, reject) => {
    const syncProcess = spawnProcess("npm", ["run", "test:env:sync"], {
      cwd: STOREFRONT_ROOT,
    });
    syncProcess.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`fixture sync exited with code ${code}`));
    });
  });
}

async function waitForHealthy(url, label) {
  const timeoutAt = Date.now() + 75_000;

  while (Date.now() < timeoutAt) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`${label} ready -> ${url}`);
        return;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`${label} did not become ready: ${url}`);
}

async function isHealthy(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

function cleanup(exitCode = 0) {
  for (const child of childProcesses) {
    child.kill("SIGTERM");
  }
  if (shouldRunSmoke || shouldRunVisualAudit || exitCode !== 0) {
    process.exit(exitCode);
  }
}

process.on("SIGINT", () => cleanup(0));
process.on("SIGTERM", () => cleanup(0));

async function main() {
  await ensureFixturesReady();

  if (shouldRunSmoke || shouldRunVisualAudit) {
    resetPort(TEST_ENV_API_PORT, "mock API");
    resetPort(TEST_ENV_MOBILE_PORT, "mobile web");
  }

  if (!(await isHealthy(`${TEST_ENV_API_ORIGIN}/__health`))) {
    spawnProcess("node", ["./tests/test-env/mock-api-server.mjs"], {
      cwd: STOREFRONT_ROOT,
      env: {
        ...process.env,
        TEST_ENV_API_PORT: String(TEST_ENV_API_PORT),
        TEST_ENV_FRONTEND_ORIGIN: TEST_ENV_MOBILE_ORIGIN,
      },
    });
  } else {
    console.log(`reusing existing mock API on ${TEST_ENV_API_ORIGIN}`);
  }

  if (!(await isHealthy(`${TEST_ENV_MOBILE_ORIGIN}/account`))) {
    spawnProcess("npm", ["run", "web", "--", "--port", String(TEST_ENV_MOBILE_PORT)], {
      cwd: MOBILE_ROOT,
      env: {
        ...process.env,
        CI: "1",
        EXPO_PUBLIC_API_BASE_URL: TEST_ENV_API_ORIGIN,
      },
    });
  } else {
    console.log(`reusing existing mobile web app on ${TEST_ENV_MOBILE_ORIGIN}`);
  }

  await waitForHealthy(`${TEST_ENV_API_ORIGIN}/__health`, "mock API");
  await waitForHealthy(`${TEST_ENV_MOBILE_ORIGIN}/account`, "mobile web");

  if (!shouldRunSmoke && !shouldRunVisualAudit) {
    console.log(`test environment running`);
    console.log(`mobile web: ${TEST_ENV_MOBILE_ORIGIN}`);
    console.log(`mock API: ${TEST_ENV_API_ORIGIN}`);
    return;
  }

  const testEnvProcess = spawnProcess("node", [shouldRunVisualAudit ? "./tests/test-env/mobile-visual-audit.mjs" : "./tests/test-env/mobile-smoke.mjs"], {
    cwd: MOBILE_ROOT,
    env: {
      ...process.env,
      PLAYWRIGHT_BASE_URL: TEST_ENV_MOBILE_ORIGIN,
    },
  });

  testEnvProcess.on("exit", (code) => cleanup(code || 0));
}

main().catch((error) => {
  console.error(error);
  cleanup(1);
});

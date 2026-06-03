import { execFileSync, spawn } from "node:child_process";
import process from "node:process";
import {
  ADMIN_ROOT,
  FIXTURE_MANIFEST_PATH,
  TEST_ENV_API_ORIGIN,
  TEST_ENV_API_PORT,
  TEST_ENV_FRONTEND_ORIGIN,
  TEST_ENV_FRONTEND_PORT,
  fileExists,
} from "./shared.mjs";

const shouldRunSmoke = process.argv.includes("--smoke");
const childProcesses = [];

function spawnProcess(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: ADMIN_ROOT,
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
  const requiredFixtures = [
    FIXTURE_MANIFEST_PATH,
    `${new URL("./fixtures/admin-customers.json", import.meta.url).pathname}`,
  ];
  const hasAllFixtures = (await Promise.all(requiredFixtures.map((fixturePath) => fileExists(fixturePath)))).every(Boolean);
  if (hasAllFixtures) {
    return;
  }

  console.log("admin fixtures missing, syncing...");
  await new Promise((resolve, reject) => {
    const syncProcess = spawnProcess("npm", ["run", "test:env:sync"]);
    syncProcess.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`admin fixture sync exited with code ${code}`));
    });
  });
}

async function waitForHealthy(url, label) {
  const timeoutAt = Date.now() + 60_000;
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
  if (shouldRunSmoke || exitCode !== 0) {
    process.exit(exitCode);
  }
}

process.on("SIGINT", () => cleanup(0));
process.on("SIGTERM", () => cleanup(0));

async function main() {
  await ensureFixturesReady();

  if (shouldRunSmoke) {
    resetPort(TEST_ENV_API_PORT, "admin mock API");
    resetPort(TEST_ENV_FRONTEND_PORT, "admin frontend");
  }

  if (!(await isHealthy(`${TEST_ENV_API_ORIGIN}/__health`))) {
    spawnProcess("node", ["./tests/test-env/mock-api-server.mjs"], {
      env: {
        ...process.env,
        ADMIN_TEST_ENV_API_PORT: String(TEST_ENV_API_PORT),
        ADMIN_TEST_ENV_FRONTEND_ORIGIN: TEST_ENV_FRONTEND_ORIGIN,
      },
    });
  } else {
    console.log(`reusing existing admin mock API on ${TEST_ENV_API_ORIGIN}`);
  }

  if (!(await isHealthy(`${TEST_ENV_FRONTEND_ORIGIN}/product-list`))) {
    spawnProcess("npx", ["next", "dev", "-p", String(TEST_ENV_FRONTEND_PORT)], {
      env: {
        ...process.env,
        NEXT_PUBLIC_API_BASE_URL: TEST_ENV_API_ORIGIN,
        NEXT_PUBLIC_STORE_URL: "http://localhost:3000",
      },
    });
  } else {
    console.log(`reusing existing admin frontend on ${TEST_ENV_FRONTEND_ORIGIN}`);
  }

  await waitForHealthy(`${TEST_ENV_API_ORIGIN}/__health`, "admin mock API");
  await waitForHealthy(`${TEST_ENV_FRONTEND_ORIGIN}/product-list`, "admin frontend");

  if (!shouldRunSmoke) {
    console.log("admin test environment running");
    console.log(`frontend: ${TEST_ENV_FRONTEND_ORIGIN}`);
    console.log(`mock API: ${TEST_ENV_API_ORIGIN}`);
    return;
  }

  const smokeProcess = spawnProcess("node", ["./tests/test-env/admin-smoke.mjs"], {
    env: {
      ...process.env,
      PLAYWRIGHT_BASE_URL: TEST_ENV_FRONTEND_ORIGIN,
    },
  });

  smokeProcess.on("exit", (code) => cleanup(code || 0));
}

main().catch((error) => {
  console.error(error);
  cleanup(1);
});

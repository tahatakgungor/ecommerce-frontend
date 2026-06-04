import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const mode = process.env.LOAD_TARGET_MODE || "storefront";
const requestsPerStep = Number(process.env.LOAD_REQUESTS_PER_STEP || (mode === "admin" ? 12 : 18));
const concurrencyLevels = (process.env.LOAD_CONCURRENCY_LEVELS || (mode === "admin" ? "2,4,6" : "3,6,9"))
  .split(",")
  .map((value) => Number(value.trim()))
  .filter((value) => Number.isFinite(value) && value > 0);

const storefrontScript = new URL("./storefront-flow-baseline.mjs", import.meta.url);
const adminScript = new URL("./admin-surface-baseline.mjs", import.meta.url);

async function runStep(concurrency) {
  const env = { ...process.env, LOAD_REQUESTS: String(requestsPerStep), LOAD_CONCURRENCY: String(concurrency) };
  const scriptPath = mode === "admin" ? adminScript.pathname : storefrontScript.pathname;

  const { stdout } = await execFileAsync("node", [scriptPath], {
    env,
    maxBuffer: 1024 * 1024 * 8,
  });

  const payload = JSON.parse(stdout.trim());
  const worstP95 = Math.max(...payload.results.map((result) => result.p95Ms));
  const hasFailure = payload.results.some((result) => !result.ok);

  return {
    concurrency,
    requestsPerStep,
    worstP95Ms: worstP95,
    ok: !hasFailure,
    results: payload.results,
  };
}

const steps = [];
for (const concurrency of concurrencyLevels) {
  steps.push(await runStep(concurrency));
}

const hasFailure = steps.some((step) => !step.ok);
console.log(
  JSON.stringify(
    {
      mode,
      requestsPerStep,
      concurrencyLevels,
      steps,
    },
    null,
    2
  )
);
if (hasFailure) {
  process.exitCode = 1;
}

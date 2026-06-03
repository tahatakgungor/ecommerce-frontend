const baseUrl = process.env.STOREFRONT_BASE || "http://localhost:3000";
const totalRequests = Number(process.env.LOAD_REQUESTS || 60);
const concurrency = Number(process.env.LOAD_CONCURRENCY || 6);
const p95Limit = Number(process.env.LOAD_MAX_P95_MS || 3000);
const failureRateLimit = Number(process.env.LOAD_MAX_FAILURE_RATE || 0.02);

const scenarios = [
  { name: "home", url: `${baseUrl}/`, expectedStatus: 200, p95Limit: 2500 },
  { name: "shop", url: `${baseUrl}/shop`, expectedStatus: 200, p95Limit },
  { name: "blog", url: `${baseUrl}/blog`, expectedStatus: 200, p95Limit: 2500 },
];

function percentile(values, ratio) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1);
  return sorted[index];
}

async function timedFetch(url) {
  const start = performance.now();
  const response = await fetch(url);
  await response.text();
  return {
    status: response.status,
    durationMs: Math.round(performance.now() - start),
  };
}

async function runScenario(scenario) {
  const durations = [];
  const statuses = new Map();
  let failures = 0;
  let cursor = 0;

  async function worker() {
    while (cursor < totalRequests) {
      const current = cursor;
      cursor += 1;
      if (current >= totalRequests) return;

      try {
        const result = await timedFetch(scenario.url);
        durations.push(result.durationMs);
        statuses.set(result.status, (statuses.get(result.status) || 0) + 1);
        if (result.status !== scenario.expectedStatus) {
          failures += 1;
        }
      } catch {
        failures += 1;
        statuses.set("network-error", (statuses.get("network-error") || 0) + 1);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const avgMs = durations.length
    ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
    : 0;
  const p95Ms = percentile(durations, 0.95);
  const p99Ms = percentile(durations, 0.99);
  const failureRate = totalRequests === 0 ? 0 : failures / totalRequests;

  return {
    name: scenario.name,
    totalRequests,
    concurrency,
    avgMs,
    p95Ms,
    p99Ms,
    failures,
    failureRate,
    statuses: Object.fromEntries(statuses),
    ok: failureRate <= failureRateLimit && p95Ms <= scenario.p95Limit,
    thresholds: {
      p95Ms: scenario.p95Limit,
      failureRate: failureRateLimit,
    },
  };
}

const results = [];
for (const scenario of scenarios) {
  results.push(await runScenario(scenario));
}

const hasFailure = results.some((result) => !result.ok);
console.log(JSON.stringify({ baseUrl, totalRequests, concurrency, results }, null, 2));
if (hasFailure) {
  process.exitCode = 1;
}

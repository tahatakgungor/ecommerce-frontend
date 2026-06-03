import http from "node:http";
import {
  FIXTURE_MANIFEST_PATH,
  PUBLIC_FIXTURES,
  TEST_ENV_API_PORT,
  TEST_ENV_FRONTEND_ORIGIN,
  fileExists,
  getFixturePath,
  readJson,
} from "./shared.mjs";

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", TEST_ENV_FRONTEND_ORIGIN);
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-XSRF-TOKEN");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
}

async function loadFixtureMap() {
  const fixtureMap = new Map();

  for (const fixture of PUBLIC_FIXTURES) {
    const fixturePath = getFixturePath(fixture.fileName);
    if (!(await fileExists(fixturePath))) {
      throw new Error(
        `Missing fixture file: ${fixture.fileName}. Run \`npm run test:env:sync\` first.`
      );
    }
    fixtureMap.set(fixture.endpoint, fixturePath);
  }

  return fixtureMap;
}

async function startServer() {
  const fixtureMap = await loadFixtureMap();

  const server = http.createServer(async (request, response) => {
    setCorsHeaders(response);

    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    if (request.url === "/__health") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ ok: true, port: TEST_ENV_API_PORT }));
      return;
    }

    if (request.url === "/__manifest") {
      const manifest = await readJson(FIXTURE_MANIFEST_PATH);
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(manifest));
      return;
    }

    const requestUrl = new URL(request.url || "/", `http://localhost:${TEST_ENV_API_PORT}`);
    const fixturePath = fixtureMap.get(requestUrl.pathname);

    if (!fixturePath) {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: false, message: "Fixture endpoint not found" }));
      return;
    }

    try {
      const payload = await readJson(fixturePath);
      response.setHeader("Content-Type", "application/json");
      response.setHeader("Set-Cookie", "XSRF-TOKEN=test-env-xsrf; Path=/");
      response.writeHead(200);
      response.end(JSON.stringify(payload));
    } catch (error) {
      response.writeHead(500, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: false, message: error.message }));
    }
  });

  server.listen(TEST_ENV_API_PORT, () => {
    console.log(`mock API ready on ${TEST_ENV_API_PORT}`);
    console.log(`frontend origin allowed: ${TEST_ENV_FRONTEND_ORIGIN}`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

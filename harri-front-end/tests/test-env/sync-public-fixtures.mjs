import {
  LIVE_PUBLIC_API_ORIGIN,
  PUBLIC_FIXTURES,
  FIXTURE_MANIFEST_PATH,
  ensureFixtureDirectory,
  getFixturePath,
  pickCollectionCount,
  writeJson,
} from "./shared.mjs";

async function syncFixtures() {
  await ensureFixtureDirectory();

  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceBaseUrl: LIVE_PUBLIC_API_ORIGIN,
    fixtures: [],
  };

  for (const fixture of PUBLIC_FIXTURES) {
    const url = new URL(fixture.endpoint, LIVE_PUBLIC_API_ORIGIN).toString();
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Fixture sync failed for ${fixture.id}: ${response.status}`);
    }

    const payload = await response.json();
    await writeJson(getFixturePath(fixture.fileName), payload);

    manifest.fixtures.push({
      id: fixture.id,
      endpoint: fixture.endpoint,
      fileName: fixture.fileName,
      count: pickCollectionCount(payload, fixture.countPath),
    });

    console.log(`synced ${fixture.id} -> ${fixture.fileName}`);
  }

  await writeJson(FIXTURE_MANIFEST_PATH, manifest);
  console.log(`fixture manifest updated: ${FIXTURE_MANIFEST_PATH}`);
}

syncFixtures().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

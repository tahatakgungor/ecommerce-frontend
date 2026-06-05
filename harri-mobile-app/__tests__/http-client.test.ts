describe("http client", () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = process.env.EXPO_PUBLIC_API_BASE_URL;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = "https://api.serravit.com";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalEnv === undefined) {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
    } else {
      process.env.EXPO_PUBLIC_API_BASE_URL = originalEnv;
    }
    jest.resetModules();
  });

  it("surfaces backend json error messages instead of raw status codes", async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: false,
      status: 404,
      headers: {
        get(name: string) {
          return name === "content-type" ? "application/json" : null;
        },
      },
      json: async () => ({ message: "Siparis bulunamadi." }),
    })) as unknown as typeof fetch;

    const { fetchJson } = require("../src/lib/http-client");

    await expect(fetchJson("/api/order/lookup?invoice=1&email=a@b.com")).rejects.toThrow("Siparis bulunamadi.");
  });
});

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

    await expect(fetchJson("/api/order/lookup?invoice=1&email=a@b.com")).rejects.toThrow("Sipariş bulunamadı.");
  });

  it("maps timeout errors to a user-friendly Turkish message", async () => {
    globalThis.fetch = jest.fn(async () => {
      throw new Error("Request timeout");
    }) as unknown as typeof fetch;

    const { fetchJson } = require("../src/lib/http-client");

    await expect(fetchJson("/api/coupon")).rejects.toThrow("Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.");
  });

  it("maps network resolution failures to a user-friendly Turkish message", async () => {
    globalThis.fetch = jest.fn(async () => {
      throw new Error('fetch failed: java.net.UnknownHostException: Unable to resolve host "api.serravit.com"');
    }) as unknown as typeof fetch;

    const { fetchJson } = require("../src/lib/http-client");

    await expect(fetchJson("/api/category/show")).rejects.toThrow(
      "Sunucuya bağlanılamadı. İnternet bağlantını kontrol edip tekrar dene."
    );
  });
});

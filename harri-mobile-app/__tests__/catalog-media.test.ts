describe("catalog media normalization", () => {
  const originalValue = process.env.EXPO_PUBLIC_API_BASE_URL;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = "https://api.serravit.com";
    jest.resetModules();
  });

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
    } else {
      process.env.EXPO_PUBLIC_API_BASE_URL = originalValue;
    }
    jest.resetModules();
  });

  it("drops stale railway-hosted product images", () => {
    const { normalizeCatalogMediaUrl } = require("../src/modules/catalog/media-url");

    expect(normalizeCatalogMediaUrl("https://ecommerce-platform-production-a905.up.railway.app/uploads/a.jpg")).toBeNull();
  });

  it("prefixes relative uploads with the active api base", () => {
    const { normalizeCatalogMediaUrl } = require("../src/modules/catalog/media-url");

    expect(normalizeCatalogMediaUrl("/uploads/a.jpg")).toBe("https://api.serravit.com/uploads/a.jpg");
  });
});

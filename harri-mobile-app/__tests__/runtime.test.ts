describe("runtime api base url validation", () => {
  const originalValue = process.env.EXPO_PUBLIC_API_BASE_URL;

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
    } else {
      process.env.EXPO_PUBLIC_API_BASE_URL = originalValue;
    }
    jest.resetModules();
  });

  it("accepts secure production urls", () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = "https://api.serravit.com/";
    const { getValidatedApiBaseUrl } = require("../src/config/runtime");

    expect(getValidatedApiBaseUrl()).toBe("https://api.serravit.com");
  });

  it("accepts localhost over http for local development", () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = "http://localhost:8081/";
    const { getValidatedApiBaseUrl } = require("../src/config/runtime");

    expect(getValidatedApiBaseUrl()).toBe("http://localhost:8081");
  });

  it("falls back to tenant api base url when env is missing", () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    const { getValidatedApiBaseUrl } = require("../src/config/runtime");

    expect(getValidatedApiBaseUrl()).toBe("https://api.serravit.com");
  });

  it("rejects non-https remote production urls", () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = "http://api.serravit.com";
    const { getValidatedApiBaseUrl } = require("../src/config/runtime");

    expect(() => getValidatedApiBaseUrl()).toThrow("Production API base URL must use https");
  });
});

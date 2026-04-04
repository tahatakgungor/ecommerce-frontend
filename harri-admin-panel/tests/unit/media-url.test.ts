import { beforeEach, describe, expect, it, vi } from "vitest";

describe("normalizeMediaUrl", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com");
  });

  it("returns absolute url for relative uploads path", async () => {
    const { normalizeMediaUrl } = await import("../../src/utils/media-url");
    expect(normalizeMediaUrl("/uploads/product.jpg")).toBe("https://api.example.com/uploads/product.jpg");
  });

  it("rewrites localhost urls using API base", async () => {
    const { normalizeMediaUrl } = await import("../../src/utils/media-url");
    expect(normalizeMediaUrl("http://localhost:8081/uploads/a.jpg")).toBe("https://api.example.com/uploads/a.jpg");
  });
});

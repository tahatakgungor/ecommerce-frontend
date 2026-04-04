import { beforeEach, describe, expect, it, vi } from "vitest";

describe("product gallery helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com");
  });

  it("merges main image and gallery with unique normalized urls", async () => {
    const { mergeGalleryImages } = await import("../../src/utils/product-gallery");

    const result = mergeGalleryImages("/uploads/main.jpg", [
      "/uploads/main.jpg",
      "http://localhost:8081/uploads/alt.jpg",
      "https://cdn.example.com/extra.jpg",
    ]);

    expect(result).toEqual([
      "https://api.example.com/uploads/main.jpg",
      "https://api.example.com/uploads/alt.jpg",
      "https://cdn.example.com/extra.jpg",
    ]);
  });

  it("resolves primary image from first available gallery image", async () => {
    const { resolvePrimaryProductImage } = await import("../../src/utils/product-gallery");

    expect(
      resolvePrimaryProductImage(
        ["http://localhost:8081/uploads/first.jpg", "/uploads/second.jpg"],
        ""
      )
    ).toBe("https://api.example.com/uploads/first.jpg");
  });
});

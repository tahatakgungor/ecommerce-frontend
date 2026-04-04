import { describe, expect, it, vi } from "vitest";

describe("media-url helpers", () => {
  it("normalizes relative and localhost URLs and builds unique gallery", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.example.com");
    const { normalizeMediaUrl, buildProductGalleryImages } = await import("../../src/utils/media-url");

    expect(normalizeMediaUrl("/uploads/p1.jpg")).toBe("https://api.example.com/uploads/p1.jpg");
    expect(normalizeMediaUrl("http://localhost:8081/uploads/p2.jpg")).toBe("https://api.example.com/uploads/p2.jpg");

    const gallery = buildProductGalleryImages({
      image: "/uploads/main.jpg",
      relatedImages: ["/uploads/main.jpg", "http://localhost:8081/uploads/alt.jpg", "https://cdn.example.com/final.jpg"],
    });

    expect(gallery).toEqual([
      "https://api.example.com/uploads/main.jpg",
      "https://api.example.com/uploads/alt.jpg",
      "https://cdn.example.com/final.jpg",
    ]);

    vi.unstubAllEnvs();
  });
});

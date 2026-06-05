import { normalizeCatalogSnapshot, normalizeProduct } from "@harri/commerce-contracts";

describe("commerce contracts", () => {
  it("normalizes a backend product response into a stable mobile product model", () => {
    const product = normalizeProduct({
      _id: "product-1",
      title: "Humata Leo",
      description: "Aciklama",
      price: 1200,
      originalPrice: 1500,
      quantity: 8,
      discount: 20,
      brand: { name: "SERRAVIT" },
      category: { name: "Gida Takviyesi" },
      parent: "Yasam ve Saglik",
      tags: ["organik", "humat"],
      relatedImages: ["https://cdn.example/image-2.jpg"],
      image: "https://cdn.example/image-1.jpg",
    });

    expect(product).toMatchObject({
      id: "product-1",
      title: "Humata Leo",
      brand: "SERRAVIT",
      category: "Gida Takviyesi",
      price: 1200,
      stockQuantity: 8,
      imageUrl: "https://cdn.example/image-1.jpg",
      gallery: ["https://cdn.example/image-2.jpg"],
    });
    expect(product.priceText).toContain("₺");
  });

  it("builds a stable catalog snapshot with category and price bounds", () => {
    const snapshot = normalizeCatalogSnapshot({
      total: 2,
      page: 1,
      size: 12,
      totalPages: 1,
      products: [
        {
          _id: "1",
          title: "Urun A",
          price: 100,
          brand: { name: "SERRAVIT" },
          category: { name: "Takviye" },
        },
        {
          _id: "2",
          title: "Urun B",
          price: 200,
          brand: { name: "HUMAT" },
          category: { name: "Takviye" },
        },
      ],
      facets: {
        brands: [{ name: "SERRAVIT" }, { name: "HUMAT" }],
      },
      priceBounds: {
        min: 100,
        max: 200,
      },
    });

    expect(snapshot.total).toBe(2);
    expect(snapshot.brands).toEqual(["SERRAVIT", "HUMAT"]);
    expect(snapshot.categories).toEqual([{ parent: "Takviye", count: 2 }]);
    expect(snapshot.priceBounds).toEqual({ min: 100, max: 200 });
  });
});

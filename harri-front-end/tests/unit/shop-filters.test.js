import { describe, expect, it } from "vitest";
import { applyShopFilters, toFilterSlug } from "../../src/utils/shop-filters";

const products = [
  {
    _id: "1",
    title: "Humicafe",
    parent: "Gıda Takviyesi",
    children: "Gıda Takviyesi",
    category: { name: "Gıda Takviyesi" },
    brand: { name: "HUMAT" },
    originalPrice: 140,
    colors: [],
  },
  {
    _id: "2",
    title: "Polihum",
    parent: "Çevre (Atık Arıtma Sistemleri)",
    children: null,
    category: { name: "Çevre (Atık Arıtma Sistemleri)" },
    brand: { name: "HUMAT" },
    originalPrice: 531,
    colors: [],
  },
  {
    _id: "3",
    title: "Serravit Şurup",
    parent: null,
    children: null,
    category: { name: "Gıda Takviyesi" },
    brand: { name: "SERRAVİT" },
    originalPrice: 200,
    colors: [],
  },
];

describe("shop filters", () => {
  it("slugifies Turkish category names consistently", () => {
    expect(toFilterSlug("Gıda Takviyesi")).toBe("gida-takviyesi");
    expect(toFilterSlug("Çevre (Atık Arıtma Sistemleri)")).toBe("cevre-atik-aritma-sistemleri");
  });

  it("filters by category using children field when present", () => {
    const result = applyShopFilters(products, { category: "gida-takviyesi" });
    expect(result.map((item) => item._id)).toEqual(["1", "3"]);
  });

  it("filters by category using fallback category.name when children is missing", () => {
    const result = applyShopFilters(products, { category: "cevre-atik-aritma-sistemleri" });
    expect(result.map((item) => item._id)).toEqual(["2"]);
  });

  it("keeps category filter applied when sorting by price", () => {
    const result = applyShopFilters(products, {
      category: "gida-takviyesi",
      shortValue: "Price high to low",
    });
    expect(result.map((item) => item._id)).toEqual(["3", "1"]);
  });
});


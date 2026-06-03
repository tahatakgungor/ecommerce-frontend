import { describe, expect, it } from "vitest";
import {
  applyShopFilters,
  buildShopRoute,
  createPricePresetRanges,
  getFacetScopedProducts,
  getPriceUiBounds,
  normalizeBrandFilters,
  resolvePriceFilters,
  toFilterSlug,
} from "../../src/utils/shop-filters";

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
  {
    _id: "4",
    title: "Magnezyum Tablet",
    parent: "Gıda Takviyesi",
    children: null,
    category: { name: "Gıda Takviyesi" },
    brand: { name: "SERRAVİT" },
    originalPrice: 350,
    colors: [],
    tags: ["Tablet", "Magnezyum"],
  },
];

describe("shop filters", () => {
  it("slugifies Turkish category names consistently", () => {
    expect(toFilterSlug("Gıda Takviyesi")).toBe("gida-takviyesi");
    expect(toFilterSlug("Çevre (Atık Arıtma Sistemleri)")).toBe("cevre-atik-aritma-sistemleri");
  });

  it("filters by category using children field when present", () => {
    const result = applyShopFilters(products, { category: "gida-takviyesi" });
    expect(result.map((item) => item._id)).toEqual(["1", "3", "4"]);
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
    expect(result.map((item) => item._id)).toEqual(["4", "3", "1"]);
  });

  it("filters by child category slug using title and tags fallback", () => {
    const result = applyShopFilters(products, { category: "tablet" });
    expect(result.map((item) => item._id)).toEqual(["4"]);
  });

  it("keeps parent category filter working when product parent values are shorter than category labels", () => {
    const result = applyShopFilters(
      [
        {
          _id: "5",
          title: "Tarım Ürünü",
          parent: "Tarım",
          children: "Gübre",
          category: { name: "Gübre" },
          brand: { name: "HUMAT" },
          originalPrice: 220,
          colors: [],
        },
        {
          _id: "6",
          title: "Sağlık Ürünü",
          parent: "Sağlık",
          children: "Gıda Takviyesi",
          category: { name: "Gıda Takviyesi" },
          brand: { name: "SERRAVİT" },
          originalPrice: 190,
          colors: [],
        },
      ],
      {
        Category: "tarim-ve-hayvancilik",
        categoryItems: [
          { parent: "Tarım ve Hayvancılık", children: ["Gübre", "Diğer"] },
          { parent: "Yaşam ve Sağlık", children: ["Gıda Takviyesi", "Kozmetik"] },
        ],
      }
    );

    expect(result.map((item) => item._id)).toEqual(["5"]);
  });

  it("matches parent category by child taxonomy when parent naming differs", () => {
    const result = applyShopFilters(
      [
        {
          _id: "6",
          title: "Sağlık Ürünü",
          parent: "Sağlık",
          children: "Gıda Takviyesi",
          category: { name: "Gıda Takviyesi" },
          brand: { name: "SERRAVİT" },
          originalPrice: 190,
          colors: [],
        },
      ],
      {
        Category: "yasam-ve-saglik",
        categoryItems: [
          { parent: "Yaşam ve Sağlık", children: ["Gıda Takviyesi", "Kozmetik"] },
        ],
      }
    );

    expect(result.map((item) => item._id)).toEqual(["6"]);
  });

  it("supports selecting more than one brand at the same time", () => {
    const result = applyShopFilters(products, { brand: ["humat", "serravit"] });
    expect(result.map((item) => item._id)).toEqual(["1", "2", "3", "4"]);
  });

  it("supports filtering with only a minimum custom price", () => {
    const result = applyShopFilters(products, { priceMin: 200 });
    expect(result.map((item) => item._id)).toEqual(["2", "3", "4"]);
  });

  it("supports filtering with only a maximum custom price", () => {
    const result = applyShopFilters(products, { max: 200 });
    expect(result.map((item) => item._id)).toEqual(["1", "3"]);
  });

  it("normalizes inverted custom price ranges before filtering", () => {
    const result = applyShopFilters(products, { priceMin: 350, max: 140 });
    expect(result.map((item) => item._id)).toEqual(["1", "3", "4"]);
  });

  it("builds brand facets from the active category scope instead of the full catalog", () => {
    const result = getFacetScopedProducts(products, {
      Category: "gida-takviyesi",
      brand: "humat",
      categoryItems: [{ parent: "Gıda Takviyesi", children: ["Gıda Takviyesi"] }],
    }, ["brand"]);

    expect(result.map((item) => item._id)).toEqual(["1", "3", "4"]);
  });
});

describe("shop query builder", () => {
  it("merges incoming filter values with existing query params", () => {
    const params = new URLSearchParams("category=tablet&color=green");
    const route = buildShopRoute(params, { brand: "humat" });
    expect(route).toBe("/shop?category=tablet&color=green&brand=humat");
  });

  it("removes filter key when value is null", () => {
    const params = new URLSearchParams("category=tablet&brand=humat");
    const route = buildShopRoute(params, { category: null });
    expect(route).toBe("/shop?brand=humat");
  });

  it("returns base shop path when all filter keys are removed", () => {
    const params = new URLSearchParams("category=tablet");
    const route = buildShopRoute(params, { category: null });
    expect(route).toBe("/shop");
  });

  it("supports repeated brand params for multi-select filters", () => {
    const params = new URLSearchParams("category=tablet");
    const route = buildShopRoute(params, { brand: ["humat", "serravit"] });
    expect(route).toBe("/shop?category=tablet&brand=humat%2Cserravit");
  });

  it("removes a multi-select filter when the next value array is empty", () => {
    const params = new URLSearchParams("brand=humat&brand=serravit");
    const route = buildShopRoute(params, { brand: [] });
    expect(route).toBe("/shop");
  });
});

describe("shop filter helpers", () => {
  it("normalizes brand filters from arrays and comma separated strings", () => {
    expect(normalizeBrandFilters(["HUMAT", "serravit"])).toEqual(["humat", "serravit"]);
    expect(normalizeBrandFilters("humat, serravit")).toEqual(["humat", "serravit"]);
  });

  it("resolves legacy and custom price params consistently", () => {
    expect(resolvePriceFilters({})).toEqual({
      minPrice: null,
      maxPrice: null,
      hasPriceFilter: false,
    });

    expect(resolvePriceFilters({ priceMax: "200" })).toEqual({
      minPrice: 200,
      maxPrice: null,
      hasPriceFilter: true,
    });

    expect(resolvePriceFilters({ priceMin: "400", max: "150" })).toEqual({
      minPrice: 150,
      maxPrice: 400,
      hasPriceFilter: true,
    });
  });

  it("creates rounded UI bounds for messy catalog prices", () => {
    expect(
      getPriceUiBounds([
        { originalPrice: 27.6 },
        { originalPrice: 161 },
        { originalPrice: 1725 },
      ])
    ).toEqual({
      min: 0,
      max: 2000,
    });
  });

  it("creates readable preset price ranges", () => {
    expect(createPricePresetRanges(27.6, 1725)).toEqual([
      { id: "range-1", min: 0, max: 499 },
      { id: "range-2", min: 500, max: 999 },
      { id: "range-3", min: 1000, max: 1499 },
      { id: "range-4", min: 1500, max: null },
    ]);
  });
});

import { applyCatalogQuery } from "@/modules/catalog/api";
import { CATALOG_SORT } from "@/modules/catalog/query";
import type { CatalogSnapshot } from "@/modules/catalog/types";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

const snapshot: CatalogSnapshot = {
  total: 3,
  page: 1,
  size: 12,
  totalPages: 1,
  brands: ["HUMAT", "OLVIT", "SERRAVİT"],
  categories: [
    { parent: "Tarım", count: 2 },
    { parent: "Yaşam ve Sağlık", count: 1 },
  ],
  priceBounds: {
    min: 230,
    max: 747.5,
  },
  products: [
    {
      id: "tarim-gubre",
      title: "Humata Humata Leo",
      description: "",
      brand: "HUMAT",
      category: "Gübre",
      parentCategory: "Tarım",
      childCategory: "Gübre",
      imageUrl: null,
      gallery: [],
      price: 747.5,
      priceText: "₺747,50",
      originalPrice: 747.5,
      originalPriceText: "₺747,50",
      discount: 0,
      stockQuantity: 12,
      tags: [],
      colors: [],
      sku: "SKU-1",
      status: "Active",
    },
    {
      id: "tarim-diger",
      title: "Olvit Akvaryum",
      description: "",
      brand: "OLVIT",
      category: "Diğer",
      parentCategory: "Tarım",
      childCategory: "Diğer",
      imageUrl: null,
      gallery: [],
      price: 230,
      priceText: "₺230",
      originalPrice: 230,
      originalPriceText: "₺230",
      discount: 0,
      stockQuantity: 12,
      tags: [],
      colors: [],
      sku: "SKU-2",
      status: "Active",
    },
    {
      id: "yasam",
      title: "Serravit Humik Asit",
      description: "Tablet formunda gıda takviyesi",
      brand: "SERRAVİT",
      category: "Gıda Takviyesi",
      parentCategory: "Yaşam ve Sağlık",
      childCategory: "Gıda Takviyesi",
      imageUrl: null,
      gallery: [],
      price: 402.5,
      priceText: "₺402,50",
      originalPrice: 402.5,
      originalPriceText: "₺402,50",
      discount: 0,
      stockQuantity: 12,
      tags: ["tablet", "bagisiklik"],
      colors: [],
      sku: "SKU-3",
      status: "Active",
    },
  ],
};

describe("catalog api query application", () => {
  it("matches parent filters against child scope when product parent labels differ", () => {
    const filtered = applyCatalogQuery(snapshot, {
      parentCategory: "Tarım ve Hayvancılık",
      categoryItems: [
        { parent: "Tarım ve Hayvancılık", children: ["Gübre", "Diğer"] },
        { parent: "Yaşam ve Sağlık", children: ["Gıda Takviyesi"] },
      ],
    });

    expect(filtered.total).toBe(2);
    expect(filtered.products.map((product) => product.id)).toEqual(["tarim-gubre", "tarim-diger"]);
  });

  it("sorts filtered results deterministically", () => {
    const filtered = applyCatalogQuery(snapshot, {
      parentCategory: "Tarım ve Hayvancılık",
      categoryItems: [{ parent: "Tarım ve Hayvancılık", children: ["Gübre", "Diğer"] }],
      sort: CATALOG_SORT.priceDesc,
    });

    expect(filtered.products.map((product) => product.price)).toEqual([747.5, 230]);
  });

  it("matches search terms against description, tags and sku in local fallback filtering", () => {
    expect(applyCatalogQuery(snapshot, { q: "tablet" }).products.map((product) => product.id)).toEqual(["yasam"]);
    expect(applyCatalogQuery(snapshot, { q: "Tablet" }).products.map((product) => product.id)).toEqual(["yasam"]);
    expect(applyCatalogQuery(snapshot, { q: "SERRAVIT tablet" }).products.map((product) => product.id)).toEqual(["yasam"]);
    expect(applyCatalogQuery(snapshot, { q: "gida takviyesi" }).products.map((product) => product.id)).toEqual(["yasam"]);
    expect(applyCatalogQuery(snapshot, { q: "bagisiklik" }).products.map((product) => product.id)).toEqual(["yasam"]);
    expect(applyCatalogQuery(snapshot, { q: "sku-3" }).products.map((product) => product.id)).toEqual(["yasam"]);
  });
});

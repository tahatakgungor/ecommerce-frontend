import { describe, expect, it } from "vitest";
import {
  buildBrandLabelLookup,
  buildCatalogQueryParams,
  getCatalogSortFromSelect,
  getSortValueForSelect,
  resolveCategoryScope,
} from "../../src/utils/catalog-query";

describe("catalog query helpers", () => {
  it("resolves category scope from the selected parent slug", () => {
    expect(resolveCategoryScope("yasam-ve-saglik", [
      { parent: "Yaşam ve Sağlık", children: ["Gıda Takviyesi", "Kozmetik"] },
    ])).toBe("Gıda Takviyesi,Kozmetik");
  });

  it("builds catalog query params with normalized brand filters and category scope", () => {
    expect(buildCatalogQueryParams({
      Category: "yasam-ve-saglik",
      category: "gida-takviyesi",
      brand: ["SERRAVİT", "humat"],
      priceMin: 100,
      max: 250,
      sort: "Price high to low",
      page: 2,
      size: 9,
      includeFacets: true,
      categoryItems: [
        { parent: "Yaşam ve Sağlık", children: ["Gıda Takviyesi", "Kozmetik"] },
      ],
    })).toEqual({
      Category: "yasam-ve-saglik",
      category: "gida-takviyesi",
      brand: "serravit,humat",
      priceMin: 100,
      max: 250,
      sort: "price_desc",
      page: 2,
      size: 9,
      categoryScope: "Gıda Takviyesi,Kozmetik",
      includeFacets: true,
    });
  });

  it("maps select values to stable catalog sort keys", () => {
    expect(getCatalogSortFromSelect("Latest Product")).toBe("latest");
    expect(getCatalogSortFromSelect("Price low to high")).toBe("price_asc");
    expect(getCatalogSortFromSelect("Price high to low")).toBe("price_desc");
    expect(getSortValueForSelect("price_desc")).toBe("Price high to low");
  });

  it("builds a brand label lookup from API facet options", () => {
    expect(buildBrandLabelLookup([
      { slug: "humat", name: "HUMAT", count: 1 },
      { slug: "serravit", name: "SERRAVİT", count: 2 },
    ])).toEqual({
      humat: "HUMAT",
      serravit: "SERRAVİT",
    });
  });
});

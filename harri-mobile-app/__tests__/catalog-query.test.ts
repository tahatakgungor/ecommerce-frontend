import {
  buildCatalogQueryParams,
  CATALOG_SORT,
  normalizeBrandFilters,
  normalizeCatalogSort,
  normalizeCategoryFilters,
  resolveCategoryScope,
  toFilterSlug,
} from "@/modules/catalog/query";

describe("catalog query helpers", () => {
  it("normalizes Turkish labels into stable slugs", () => {
    expect(toFilterSlug("Yaşam & Sağlık")).toBe("yasam-saglik");
    expect(toFilterSlug("Çocuk Ürünleri")).toBe("cocuk-urunleri");
  });

  it("deduplicates category and brand filters", () => {
    expect(normalizeCategoryFilters("Bagisiklik, bagisiklik, Enerji")).toEqual(["bagisiklik", "enerji"]);
    expect(normalizeBrandFilters(["Serravit", "serravit", "Humat"])).toEqual(["serravit", "humat"]);
  });

  it("resolves category scope from parent metadata", () => {
    expect(
      resolveCategoryScope("yasam-ve-saglik", [
        {
          parent: "Yasam ve Saglik",
          children: ["Bagisiklik", "Detoks"],
        },
      ])
    ).toBe("Bagisiklik,Detoks");
  });

  it("builds API params for search, parent category, brand and sort", () => {
    const params = buildCatalogQueryParams({
      q: "humat",
      parentCategory: "yasam-ve-saglik",
      brand: "serravit",
      sort: CATALOG_SORT.priceDesc,
      page: 2,
      size: 24,
      categoryItems: [
        {
          parent: "Yasam ve Saglik",
          children: ["Bagisiklik", "Detoks"],
        },
      ],
    });

    expect(params).toContain("q=humat");
    expect(params).toContain("Category=yasam-ve-saglik");
    expect(params).toContain("brand=serravit");
    expect(params).toContain("sort=price_desc");
    expect(params).toContain("page=2");
    expect(params).toContain("size=24");
    expect(params).toContain("categoryScope=Bagisiklik%2CDetoks");
  });

  it("falls back to latest sort for unknown input", () => {
    expect(normalizeCatalogSort("unknown")).toBe(CATALOG_SORT.latest);
  });
});

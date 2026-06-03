'use client';
import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// internal
import { Search } from "@svg/index";
import { useLanguage } from "src/context/LanguageContext";
import { buildShopRoute, normalizeBrandFilters, toFilterSlug } from "src/utils/shop-filters";

const ShopModel = ({ all_products }) => {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang } = useLanguage();
  const activeBrands = useMemo(
    () => normalizeBrandFilters(searchParams.getAll("brand")),
    [searchParams]
  );
  const activeBrandSet = useMemo(() => new Set(activeBrands), [activeBrands]);
  const brandLookup = useMemo(
    () =>
      (all_products || []).reduce((acc, product) => {
        const brandName = product?.brand?.name;
        const brandSlug = toFilterSlug(brandName);
        if (!brandSlug) return acc;

        if (!acc[brandSlug]) {
          acc[brandSlug] = {
            slug: brandSlug,
            name: brandName,
            count: 0,
          };
        }

        acc[brandSlug].count += 1;
        return acc;
      }, {}),
    [all_products]
  );
  const allBrands = useMemo(
    () =>
      Object.values(brandLookup).sort((left, right) =>
        String(left?.name || "").localeCompare(String(right?.name || ""), lang === "tr" ? "tr" : "en", {
          sensitivity: "base",
        })
      ),
    [brandLookup, lang]
  );
  const brands = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    if (!normalizedSearch) {
      return allBrands;
    }
    return allBrands.filter((brand) =>
      String(brand?.name || "").toLowerCase().includes(normalizedSearch)
    );
  }, [allBrands, searchValue]);

  const handleBrand = (value) => {
    const brandSlug = toFilterSlug(value);
    const nextBrands = activeBrandSet.has(brandSlug)
      ? activeBrands.filter((item) => item !== brandSlug)
      : [...activeBrands, brandSlug];
    const route = buildShopRoute(searchParams, {
      brand: nextBrands,
    });
    router.push(route);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleSearchValue = (event) => {
    setSearchValue(event.target.value);
  };

  return (
    <div className="accordion" id="shop_model">
      <div className="accordion-item">
        <h2 className="accordion-header" id="model__widget">
          <button
            className="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#model_widget_collapse"
            aria-expanded="true"
            aria-controls="model_widget_collapse"
          >
            {t('brand')}
          </button>
        </h2>
        <div
          id="model_widget_collapse"
          className="accordion-collapse collapse show"
          aria-labelledby="model__widget"
          data-bs-parent="#shop_model"
        >
          <div className="accordion-body">
            <div className="shop__widget-search pt-10 pb-25">
              <form onSubmit={handleSubmit}>
                <div className="shop__widget-search-input">
                  <input
                    onChange={handleSearchValue}
                    type="text"
                    value={searchValue}
                    placeholder={lang === "tr" ? "Marka ara" : "Search brands"}
                  />
                  <button type="submit">
                    <Search />
                  </button>
                </div>
              </form>
            </div>
            <div className="shop__filter-summary-note pb-15">
              {activeBrands.length > 0
                ? lang === "tr"
                  ? `${activeBrands.length} marka seçildi`
                  : `${activeBrands.length} brands selected`
                : lang === "tr"
                  ? "Birden fazla seçim yapabilirsiniz."
                  : "You can select multiple brands."}
            </div>
            <div
              className="shop__widget-list"
              style={{ maxHeight: brands.length > 2 ? "160px" : undefined, overflowY: brands.length > 2 ? "auto" : undefined }}
            >
              {brands.map((brand, i) => (
                <div
                  key={brand.slug}
                  className={`shop__widget-list-item ${activeBrandSet.has(brand.slug) ? "is-active" : ""}`}
                >
                  <input
                    type="checkbox"
                    id={`brand-${brand.slug}-${i}`}
                    checked={activeBrandSet.has(brand.slug)}
                    onChange={() => handleBrand(brand.name)}
                    aria-label={brand.name}
                  />
                  <label htmlFor={`brand-${brand.slug}-${i}`}>
                    {brand.name}
                    <span className="shop__filter-meta-count">({brand.count})</span>
                  </label>
                </div>
              ))}
              {brands.length === 0 && (
                <p className="mb-0 text-muted small">
                  {lang === "tr" ? "Eşleşen marka bulunamadı." : "No brands found."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopModel;

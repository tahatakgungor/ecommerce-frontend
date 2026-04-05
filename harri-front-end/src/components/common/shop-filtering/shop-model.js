'use client';
import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// internal
import { Search } from "@svg/index";
import { useLanguage } from "src/context/LanguageContext";
import { buildShopRoute, toFilterSlug } from "src/utils/shop-filters";

const ShopModel = ({ all_products }) => {
  let all_brands = [...new Set(all_products.map((prd) => prd.brand?.name))];
  const [brands, setBrands] = useState(all_brands);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeBrand = searchParams.get("brand");
  const { t } = useLanguage();
  const activeBrandSlug = useMemo(() => toFilterSlug(activeBrand), [activeBrand]);

  const handleBrand = (value) => {
    const brandSlug = toFilterSlug(value);
    const route = buildShopRoute(searchParams, {
      brand: activeBrandSlug === brandSlug ? null : brandSlug,
    });
    router.push(route);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchValue) {
      let searchBrands = all_brands.filter((b) =>
        b?.toLowerCase().includes(searchValue.toLowerCase())
      );
      setBrands(searchBrands);
    } else {
      setBrands(all_brands);
    }
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
                    placeholder={t('brand') + "..."}
                  />
                  <button type="submit">
                    <Search />
                  </button>
                </div>
              </form>
            </div>
            <div
              className="shop__widget-list"
              style={{ maxHeight: brands.length > 2 ? "160px" : undefined, overflowY: brands.length > 2 ? "auto" : undefined }}
            >
              {brands.map((brand, i) => (
                <div
                  key={i}
                  className={`shop__widget-list-item ${activeBrandSlug === toFilterSlug(brand) ? "is-active" : ""}`}
                >
                  <input
                    type="checkbox"
                    id={`brand-${toFilterSlug(brand)}-${i}`}
                    checked={activeBrandSlug === toFilterSlug(brand)}
                    readOnly
                  />
                  <label
                    onClick={() => handleBrand(brand)}
                    htmlFor={`brand-${toFilterSlug(brand)}-${i}`}
                  >
                    {brand}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopModel;

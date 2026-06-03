import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// internal
import { ShopShortSelect, ShopShortTab, ShowingResult } from "./shop-top-bar";
import ShopSidebar from "@components/common/sidebar/shop-sidebar";
import ProductGridItems from "./prd-grid-items";
import ProductListItems from "./prd-list-items";
import ShopActiveFilters from "./shop-active-filters";
import { useLanguage } from "src/context/LanguageContext";

const ShopArea = ({ products, all_products, brandFacetProducts, priceFacetProducts, shortHandler }) => {
  const [showingGridItems, setShowingGridItems] = useState(0);
  const [showingListItems, setShowingListItems] = useState(0);
  const [tabActive, setActiveTab] = useState("grid");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const handleTab = (value) => {
    setActiveTab(value);
  };

  useEffect(() => {
    setIsFilterDrawerOpen(false);
  }, [searchParams]);

  useEffect(() => {
    if (!isFilterDrawerOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFilterDrawerOpen]);

  return (
    <section className="shop__area pb-60">
      <div className="container">
        <div className="shop__top mb-50">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-5">
              <ShowingResult
                show={
                  tabActive === "grid" ? showingGridItems : showingListItems
                }
                total={products.length}
              />
            </div>
            <div className="col-lg-6 col-md-7">
              <div className="shop__sort d-flex flex-wrap justify-content-md-end align-items-center">
                <div className="d-none d-md-block">
                  <ShopShortTab handleTab={handleTab} />
                </div>
                <button
                  type="button"
                  className="tp-btn-border d-lg-none shop__mobile-filter-btn"
                  onClick={() => setIsFilterDrawerOpen(true)}
                >
                  <i className="fa-regular fa-sliders me-1"></i>
                  {t("filter")}
                </button>
                <ShopShortSelect shortHandler={shortHandler}/>
              </div>
            </div>
          </div>
        </div>
        <div className="shop__main">
          <div className="row">
            <div className="col-lg-3 d-none d-lg-block">
              {/* sidebar start */}
              <ShopSidebar
                all_products={all_products}
                brandFacetProducts={brandFacetProducts}
                priceFacetProducts={priceFacetProducts}
              />
              {/* sidebar end */}
            </div>
            <div className={`col-lg-9 order-first order-lg-last`}>
              <ShopActiveFilters all_products={all_products} />
              <div className="shop__tab-content mb-40">
                {products.length > 0 ? (
                  <div className="tab-content" id="shop_tab_content">
                    <ProductGridItems
                      itemsPerPage={9}
                      items={products}
                      setShowingGridItems={setShowingGridItems}
                    />
                    <ProductListItems
                      itemsPerPage={5}
                      items={products}
                      setShowingListItems={setShowingListItems}
                    />
                  </div>
                ) : (
                  <div className="shop__empty-state">
                    <h4>{t("noResults")}</h4>
                    <p>
                      {t("noResultsResetHint")}
                    </p>
                    <button type="button" className="tp-btn" onClick={() => router.push("/shop")}>
                      {t("clearFilters")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isFilterDrawerOpen && (
        <>
          <div
            role="presentation"
            onClick={() => setIsFilterDrawerOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              zIndex: 998,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              zIndex: 999,
            }}
            className="shop__mobile-filter-drawer"
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 style={{ margin: 0, fontSize: 18 }}>{t("filter")}</h5>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                style={{ border: "none", background: "transparent", fontSize: 22, lineHeight: 1 }}
                aria-label={t("cancelAction")}
              >
                <i className="fa-regular fa-xmark"></i>
              </button>
            </div>
            <ShopSidebar
              all_products={all_products}
              brandFacetProducts={brandFacetProducts}
              priceFacetProducts={priceFacetProducts}
            />
          </div>
        </>
      )}
    </section>
  );
};

export default ShopArea;

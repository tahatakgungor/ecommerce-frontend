import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
// internal
import ErrorMessage from "@components/error-message/error";
import { useGetCategoriesQuery } from "src/redux/features/categoryApi";
import ShopCategoryLoader from "@components/loader/shop-category-loader";
import { buildShopRoute, toFilterSlug } from "src/utils/shop-filters";
import { useLanguage } from "src/context/LanguageContext";

const ShopCategory = () => {
  const { lang } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const activeParent = searchParams.get("Category");
  const { data: categories, isLoading, isError } = useGetCategoriesQuery();
  // decide what to render
  let content = null;

  if (isLoading) {
    content = (
      <ShopCategoryLoader loading={isLoading}/>
    );
  }

  if (!isLoading && isError) {
    content = <ErrorMessage message="There was an error" />;
  }

  if (!isLoading && !isError && categories?.categories?.length === 0) {
    content = <ErrorMessage message="No Category found!" />;
  }

  if (!isLoading && !isError && categories?.categories?.length > 0) {
    const category_items = categories.categories;
    content = category_items.map((category, i) => {
      const parentSlug = toFilterSlug(category.parent);
      const hasActiveChild = category.children?.some(
        (child) => toFilterSlug(child) === toFilterSlug(activeCategory)
      );
      const isActiveParent = parentSlug === toFilterSlug(activeParent);
      const shouldExpand = activeCategory || activeParent ? (hasActiveChild || isActiveParent) : i === 0;
      return (
        <div key={category._id} className="card">
        <div className="card-header white-bg" id={`heading-${i + 1}`}>
          <h5 className="mb-0">
            <button
              className={`shop-accordion-btn ${shouldExpand ? "" : "collapsed"} ${(hasActiveChild || isActiveParent) ? "is-active" : ""}`}
              data-bs-toggle="collapse"
              data-bs-target={`#collapse-${i + 1}`}
              aria-expanded={shouldExpand ? "true" : "false"}
              aria-controls={`#collapse-${i + 1}`}
              onClick={() => {
                const isSameParent = toFilterSlug(activeParent) === parentSlug && !activeCategory;
                const route = buildShopRoute(searchParams, {
                  Category: isSameParent ? null : parentSlug,
                  category: null,
                });
                router.push(route);
              }}
            >
              {category.parent}
            </button>
          </h5>
        </div>

        <div
          id={`collapse-${i + 1}`}
          className={`accordion-collapse collapse ${shouldExpand ? "show" : ""}`}
          aria-labelledby={`heading-${i + 1}`}
          data-bs-parent="#accordion-items"
        >
          <div className="card-body">
            <div className="categories__list">
              <ul>
                {category.children.map((item, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      className={`shop-filter-link ${toFilterSlug(item) === toFilterSlug(activeCategory) ? "shop-filter-link--active" : ""}`}
                      onClick={() => {
                        const nextCategory = toFilterSlug(item);
                        const isSameSelection =
                          toFilterSlug(activeCategory) === nextCategory &&
                          toFilterSlug(activeParent) === parentSlug;
                        const route = buildShopRoute(searchParams, {
                          category: isSameSelection ? null : nextCategory,
                          Category: isSameSelection ? null : parentSlug,
                        });
                        router.push(route);
                      }}
                      style={{ cursor: "pointer", textTransform: "capitalize" }}
                      aria-pressed={toFilterSlug(item) === toFilterSlug(activeCategory)}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        </div>
      );
    });
  }

  return (
    <div className="accordion-item">
      <h2 className="accordion-header" id="category__widget">
        <button
          className="accordion-button"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#category_widget_collapse"
          aria-expanded="true"
          aria-controls="category_widget_collapse"
        >
          {lang === "tr" ? "Kategori" : "Category"}
        </button>
      </h2>
      <div
        id="category_widget_collapse"
        className="accordion-collapse collapse show"
        aria-labelledby="category__widget"
        data-bs-parent="#shop_category"
      >
      <div className="sidebar__widget-content">
        <div className="categories">
          <div id="accordion-items">{content}</div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ShopCategory;

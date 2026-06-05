'use client';
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ErrorMessage from "@components/error-message/error";
import { useGetCategoriesQuery } from "src/redux/features/categoryApi";
import ShopCategoryLoader from "@components/loader/shop-category-loader";
import {
  buildShopRoute,
  normalizeCategoryFilters,
  toFilterSlug,
} from "src/utils/shop-filters";
import { useLanguage } from "src/context/LanguageContext";

function areSetsEqual(left, right) {
  if (left.size !== right.size) return false;
  return Array.from(left).every((value) => right.has(value));
}

const ShopCategory = ({ categoryItems: initialCategoryItems }) => {
  const { lang } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeParent = toFilterSlug(searchParams.get("Category"));
  const activeCategories = useMemo(
    () => normalizeCategoryFilters(searchParams.getAll("category")),
    [searchParams]
  );
  const activeCategoryKey = activeCategories.join(",");
  const activeCategorySet = useMemo(() => new Set(activeCategories), [activeCategories]);
  const { data: categoriesData, isLoading, isError } = useGetCategoriesQuery(undefined, {
    skip: Array.isArray(initialCategoryItems) && initialCategoryItems.length > 0,
  });
  const [expandedParents, setExpandedParents] = useState([]);
  const categoryItems = useMemo(
    () => initialCategoryItems?.length ? initialCategoryItems : categoriesData?.categories || [],
    [categoriesData?.categories, initialCategoryItems]
  );

  useEffect(() => {
    if (!Array.isArray(categoryItems) || categoryItems.length === 0) return;

    const nextExpanded = new Set();
    const selectedCategorySet = new Set(activeCategories);
    if (!activeParent && activeCategories.length === 0) {
      nextExpanded.add(toFilterSlug(categoryItems[0]?.parent));
    }

    if (activeParent) {
      nextExpanded.add(activeParent);
    }

    categoryItems.forEach((category) => {
      const parentSlug = toFilterSlug(category?.parent);
      const hasActiveChild = (category?.children || []).some((child) =>
        selectedCategorySet.has(toFilterSlug(child))
      );
      if (hasActiveChild && parentSlug) {
        nextExpanded.add(parentSlug);
      }
    });

    setExpandedParents((prev) => {
      const prevSet = new Set(prev);
      nextExpanded.forEach((item) => prevSet.add(item));
      return areSetsEqual(prevSet, new Set(prev)) ? prev : Array.from(prevSet);
    });
  }, [activeCategories, activeCategoryKey, activeParent, categoryItems]);

  const toggleExpanded = (parentSlug) => {
    setExpandedParents((prev) =>
      prev.includes(parentSlug) ? prev.filter((item) => item !== parentSlug) : [...prev, parentSlug]
    );
  };

  const handleParentFilter = (parentSlug) => {
    const route = buildShopRoute(searchParams, {
      Category: activeParent === parentSlug && activeCategories.length === 0 ? null : parentSlug,
      category: null,
      page: null,
    });
    router.push(route);
  };

  const handleChildToggle = (parentSlug, childValue) => {
    const childSlug = toFilterSlug(childValue);
    const nextCategories = activeCategorySet.has(childSlug)
      ? activeCategories.filter((item) => item !== childSlug)
      : [...activeCategories, childSlug];

    if (!expandedParents.includes(parentSlug)) {
      setExpandedParents((prev) => [...prev, parentSlug]);
    }

    router.push(
      buildShopRoute(searchParams, {
        Category: null,
        category: nextCategories,
        page: null,
      })
    );
  };

  let content = null;

  if (isLoading) {
    content = <ShopCategoryLoader loading={isLoading} />;
  }

  if (!isLoading && isError && categoryItems.length === 0) {
    content = <ErrorMessage message={lang === "tr" ? "Bir sorun oluştu." : "Something went wrong."} />;
  }

  if (!isLoading && !isError && categoryItems.length === 0) {
    content = <ErrorMessage message={lang === "tr" ? "Kategori bulunamadı." : "No categories found."} />;
  }

  if (!isLoading && !isError && categoryItems.length > 0) {
    content = (
      <div className="shop__category-groups">
        <p className="shop__filter-summary-note">
          {lang === "tr"
            ? "Önce ana kategoriyi seçebilir, isterseniz birden fazla alt kategori işaretleyebilirsiniz."
            : "Start with the main category or select multiple subcategories."}
        </p>
        {categoryItems.map((category) => {
          const parentSlug = toFilterSlug(category?.parent);
          const children = Array.isArray(category?.children) ? category.children : [];
          const isExpanded = expandedParents.includes(parentSlug);
          const hasActiveChild = children.some((child) => activeCategorySet.has(toFilterSlug(child)));
          const isParentOnlyActive = activeParent === parentSlug && activeCategories.length === 0;

          return (
            <section
              key={category._id || parentSlug}
              className={`shop__category-group ${isExpanded ? "is-open" : ""} ${(hasActiveChild || isParentOnlyActive) ? "is-active" : ""}`}
            >
              <button
                type="button"
                className="shop__category-group-toggle"
                onClick={() => toggleExpanded(parentSlug)}
                aria-expanded={isExpanded}
              >
                <span>
                  <strong>{category.parent}</strong>
                  <small>{children.length} {lang === "tr" ? "alt kategori" : "subcategories"}</small>
                </span>
                <i className="fa-regular fa-chevron-down" aria-hidden="true"></i>
              </button>

              {isExpanded && (
                <div className="shop__category-group-body">
                  <button
                    type="button"
                    className={`shop__category-overview ${isParentOnlyActive ? "is-active" : ""}`}
                    onClick={() => handleParentFilter(parentSlug)}
                    aria-pressed={isParentOnlyActive}
                  >
                    <span className="shop__category-overview-copy">
                      <strong>
                        {lang === "tr" ? `Tüm ${category.parent}` : `All ${category.parent}`}
                      </strong>
                      <small>
                        {lang === "tr"
                          ? "Alt kategori seçmeden bu kategorideki tüm ürünleri göster"
                          : "Show every product in this category without narrowing to a subcategory"}
                      </small>
                    </span>
                    <span className="shop__category-overview-indicator" aria-hidden="true">
                      <i className={`fa-regular ${isParentOnlyActive ? "fa-circle-check" : "fa-angle-right"}`}></i>
                    </span>
                  </button>

                  <div className="shop__category-option-list">
                    {children.map((child, index) => {
                      const childSlug = toFilterSlug(child);
                      const isActive = activeCategorySet.has(childSlug);

                      return (
                        <label
                          key={`${parentSlug}-${childSlug}-${index}`}
                          className={`shop__category-option ${isActive ? "is-active" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => handleChildToggle(parentSlug, child)}
                            aria-label={child}
                          />
                          <span>{child}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    );
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
          <div className="categories">{content}</div>
        </div>
      </div>
    </div>
  );
};

export default ShopCategory;

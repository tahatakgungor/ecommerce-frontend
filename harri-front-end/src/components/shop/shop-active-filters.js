'use client';
import React, { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "src/context/LanguageContext";
import {
  buildShopRoute,
  normalizeBrandFilters,
  normalizeCategoryFilters,
  resolvePriceFilters,
} from "src/utils/shop-filters";
import { buildBrandLabelLookup } from "src/utils/catalog-query";

function formatFilterLabel(value) {
  const decoded = decodeURIComponent(String(value || ""));
  if (!decoded) return "";
  if (decoded.includes(" ")) return decoded;

  return decoded
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildCategoryLabelLookup(categoryItems = []) {
  return (Array.isArray(categoryItems) ? categoryItems : []).reduce((acc, item) => {
    (item?.children || []).forEach((child) => {
      const slug = normalizeCategoryFilters(child)[0];
      if (slug) {
        acc[slug] = child;
      }
    });
    return acc;
  }, {});
}

const ShopActiveFilters = ({ brandOptions, categoryItems }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const activeBrands = useMemo(
    () => normalizeBrandFilters(searchParams.getAll("brand")),
    [searchParams]
  );
  const brandLabelLookup = useMemo(
    () => buildBrandLabelLookup(brandOptions),
    [brandOptions]
  );
  const categoryLabelLookup = useMemo(
    () => buildCategoryLabelLookup(categoryItems),
    [categoryItems]
  );
  const priceFilter = useMemo(
    () =>
      resolvePriceFilters({
        priceMin: searchParams.get("priceMin"),
        max: searchParams.get("max"),
        priceMax: searchParams.get("priceMax"),
      }),
    [searchParams]
  );
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-US", {
        style: "currency",
        currency: "TRY",
        maximumFractionDigits: 0,
      }),
    [lang]
  );

  const chips = [];
  const parentCategory = searchParams.get("Category");
  const childCategories = normalizeCategoryFilters(searchParams.getAll("category"));

  if (parentCategory && childCategories.length === 0) {
    chips.push({
      id: "parent-category",
      label: formatFilterLabel(parentCategory),
      onRemove: () => router.push(buildShopRoute(searchParams, { Category: null, category: null, page: null })),
    });
  }

  childCategories.forEach((categorySlug) => {
    const nextCategories = childCategories.filter((item) => item !== categorySlug);
    chips.push({
      id: `child-category-${categorySlug}`,
      label: categoryLabelLookup[categorySlug] || formatFilterLabel(categorySlug),
      onRemove: () => router.push(buildShopRoute(searchParams, { category: nextCategories, page: null })),
    });
  });

  activeBrands.forEach((brandSlug) => {
    const nextBrands = activeBrands.filter((item) => item !== brandSlug);
    chips.push({
      id: `brand-${brandSlug}`,
      label: brandLabelLookup[brandSlug] || formatFilterLabel(brandSlug),
      onRemove: () => router.push(buildShopRoute(searchParams, { brand: nextBrands, page: null })),
    });
  });

  if (priceFilter.hasPriceFilter) {
    const label =
      priceFilter.minPrice !== null && priceFilter.maxPrice !== null
        ? `${currencyFormatter.format(priceFilter.minPrice)} - ${currencyFormatter.format(priceFilter.maxPrice)}`
        : priceFilter.minPrice !== null
          ? `${currencyFormatter.format(priceFilter.minPrice)}+`
          : lang === "tr"
            ? `${currencyFormatter.format(priceFilter.maxPrice)} altı`
            : `Under ${currencyFormatter.format(priceFilter.maxPrice)}`;

    chips.push({
      id: "price-range",
      label,
      onRemove: () => router.push(buildShopRoute(searchParams, { priceMin: null, max: null, priceMax: null, page: null })),
    });
  }

  if (!chips.length) {
    return null;
  }

  return (
    <div className="shop__active-filters">
      <div className="shop__active-filters-head">
        <h6>{lang === "tr" ? "Seçili Filtreler" : "Selected Filters"}</h6>
        <button type="button" className="shop__active-filters-clear" onClick={() => router.push("/shop")}>
          {lang === "tr" ? "Temizle" : "Clear"}
        </button>
      </div>
      <div className="shop__active-filters-list">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className="shop__active-filter-chip"
            onClick={chip.onRemove}
          >
            <span>{chip.label}</span>
            <i className="fa-regular fa-xmark" aria-hidden="true"></i>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShopActiveFilters;

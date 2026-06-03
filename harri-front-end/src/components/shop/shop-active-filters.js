'use client';
import React, { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "src/context/LanguageContext";
import {
  buildShopRoute,
  normalizeBrandFilters,
  resolvePriceFilters,
  toFilterSlug,
} from "src/utils/shop-filters";

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

const ShopActiveFilters = ({ all_products }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const activeBrands = useMemo(
    () => normalizeBrandFilters(searchParams.getAll("brand")),
    [searchParams]
  );
  const brandLabelLookup = useMemo(
    () =>
      (Array.isArray(all_products) ? all_products : []).reduce((acc, product) => {
        const brandName = product?.brand?.name;
        const brandSlug = toFilterSlug(brandName);
        if (brandSlug && !acc[brandSlug]) {
          acc[brandSlug] = brandName;
        }
        return acc;
      }, {}),
    [all_products]
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
  const childCategory = searchParams.get("category");

  if (parentCategory) {
    chips.push({
      id: "parent-category",
      label: formatFilterLabel(parentCategory),
      onRemove: () => router.push(buildShopRoute(searchParams, { Category: null, category: null })),
    });
  }

  if (childCategory) {
    chips.push({
      id: "child-category",
      label: formatFilterLabel(childCategory),
      onRemove: () => router.push(buildShopRoute(searchParams, { category: null })),
    });
  }

  activeBrands.forEach((brandSlug) => {
    const nextBrands = activeBrands.filter((item) => item !== brandSlug);
    chips.push({
      id: `brand-${brandSlug}`,
      label: brandLabelLookup[brandSlug] || formatFilterLabel(brandSlug),
      onRemove: () => router.push(buildShopRoute(searchParams, { brand: nextBrands })),
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
      onRemove: () => router.push(buildShopRoute(searchParams, { priceMin: null, max: null, priceMax: null })),
    });
  }

  if (!chips.length) {
    return null;
  }

  return (
    <div className="shop__active-filters">
      <div className="shop__active-filters-head">
        <h6>{lang === "tr" ? "Aktif filtreler" : "Active filters"}</h6>
        <button type="button" className="shop__active-filters-clear" onClick={() => router.push("/shop")}>
          {lang === "tr" ? "Tümünü temizle" : "Clear all"}
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

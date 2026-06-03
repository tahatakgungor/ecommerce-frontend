'use client';
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PriceItem from "./price-item";
import { useLanguage } from "src/context/LanguageContext";
import { buildShopRoute, resolvePriceFilters } from "src/utils/shop-filters";

function getCatalogPriceBounds(products) {
  const prices = (Array.isArray(products) ? products : [])
    .map((product) => Number(product?.originalPrice))
    .filter((price) => Number.isFinite(price) && price >= 0)
    .sort((left, right) => left - right);

  if (!prices.length) {
    return { min: 0, max: 0 };
  }

  return {
    min: prices[0],
    max: prices[prices.length - 1],
  };
}

function clampPrice(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function createPresetRanges(minPrice, maxPrice) {
  if (maxPrice <= minPrice) {
    return [{ id: "all", min: minPrice, max: null }];
  }

  const spread = maxPrice - minPrice;
  const bucket = Math.max(50, Math.ceil(spread / 4 / 10) * 10);
  const firstMax = Math.min(maxPrice, minPrice + bucket);
  const secondMin = Math.min(maxPrice, firstMax + 1);
  const secondMax = Math.min(maxPrice, secondMin + bucket);
  const thirdMin = Math.min(maxPrice, secondMax + 1);
  const thirdMax = Math.min(maxPrice, thirdMin + bucket);
  const fourthMin = Math.min(maxPrice, thirdMax + 1);

  return [
    { id: "one", min: minPrice, max: firstMax },
    { id: "two", min: secondMin, max: secondMax },
    { id: "three", min: thirdMin, max: thirdMax },
    { id: "four", min: fourthMin, max: null },
  ].filter((item, index, array) => {
    if (item.min > maxPrice) return false;
    if (item.max !== null && item.min > item.max) return false;

    return (
      index === 0 ||
      item.min !== array[index - 1].min ||
      item.max !== array[index - 1].max
    );
  });
}

const ShopPrice = ({ all_products }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const { min: catalogMinPrice, max: catalogMaxPrice } = useMemo(
    () => getCatalogPriceBounds(all_products),
    [all_products]
  );
  const { minPrice, maxPrice, hasPriceFilter } = useMemo(
    () =>
      resolvePriceFilters({
        priceMin: searchParams.get("priceMin"),
        max: searchParams.get("max"),
        priceMax: searchParams.get("priceMax"),
      }),
    [searchParams]
  );
  const [draftMin, setDraftMin] = useState(catalogMinPrice);
  const [draftMax, setDraftMax] = useState(catalogMaxPrice);
  const sliderStep = useMemo(
    () => Math.max(1, Math.ceil((catalogMaxPrice - catalogMinPrice || 1) / 100)),
    [catalogMaxPrice, catalogMinPrice]
  );
  const presetRanges = useMemo(
    () => createPresetRanges(catalogMinPrice, catalogMaxPrice),
    [catalogMaxPrice, catalogMinPrice]
  );

  useEffect(() => {
    setDraftMin(minPrice ?? catalogMinPrice);
    setDraftMax(maxPrice ?? catalogMaxPrice);
  }, [catalogMaxPrice, catalogMinPrice, maxPrice, minPrice]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-US", {
        style: "currency",
        currency: "TRY",
        maximumFractionDigits: 0,
      }),
    [lang]
  );

  const applyCustomRange = () => {
    if (catalogMaxPrice <= 0) return;

    let nextMin = clampPrice(draftMin, catalogMinPrice, catalogMaxPrice);
    let nextMax = clampPrice(draftMax, catalogMinPrice, catalogMaxPrice);

    if (nextMin > nextMax) {
      [nextMin, nextMax] = [nextMax, nextMin];
    }

    const normalizedMin = nextMin <= catalogMinPrice ? null : Math.round(nextMin);
    const normalizedMax = nextMax >= catalogMaxPrice ? null : Math.round(nextMax);

    router.push(
      buildShopRoute(searchParams, {
        priceMin: normalizedMin,
        max: normalizedMax,
        priceMax: null,
      })
    );
  };

  const resetCustomRange = () => {
    setDraftMin(catalogMinPrice);
    setDraftMax(catalogMaxPrice);
    router.push(buildShopRoute(searchParams, { priceMin: null, max: null, priceMax: null }));
  };

  const handleMinValue = (value) => {
    const nextValue = clampPrice(value, catalogMinPrice, catalogMaxPrice);
    setDraftMin(Math.min(nextValue, draftMax));
  };

  const handleMaxValue = (value) => {
    const nextValue = clampPrice(value, catalogMinPrice, catalogMaxPrice);
    setDraftMax(Math.max(nextValue, draftMin));
  };

  return (
    <div className="accordion-item">
      <h2 className="accordion-header" id="price__widget">
        <button
          className="accordion-button"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#price_widget_collapse"
          aria-expanded="true"
          aria-controls="price_widget_collapse"
        >
          {lang === "tr" ? "Fiyat" : "Price"}
        </button>
      </h2>
      <div
        id="price_widget_collapse"
        className="accordion-collapse collapse show"
        aria-labelledby="price__widget"
        data-bs-parent="#shop_price"
      >
        <div className="accordion-body">
          <div className="shop__filter-summary-note pb-15">
            {lang === "tr"
              ? `Katalog aralığı: ${currencyFormatter.format(catalogMinPrice)} - ${currencyFormatter.format(catalogMaxPrice)}`
              : `Catalog range: ${currencyFormatter.format(catalogMinPrice)} - ${currencyFormatter.format(catalogMaxPrice)}`}
          </div>

          <div
            className="shop__widget-list shop__widget-list--scrollable"
            style={{ maxHeight: presetRanges.length > 2 ? "180px" : undefined }}
          >
            {presetRanges.map((item) => (
              <PriceItem key={item.id} {...item} />
            ))}
          </div>

          <div className="shop__price-range-card mt-20">
            <div className="shop__price-range-head">
              <h6>{lang === "tr" ? "Özel fiyat aralığı" : "Custom price range"}</h6>
              {hasPriceFilter && (
                <span className="shop__price-range-badge">
                  {lang === "tr" ? "Aktif" : "Active"}
                </span>
              )}
            </div>

            <div className="shop__price-range-values">
              <div className="shop__price-range-field">
                <label htmlFor="shop-price-min">{lang === "tr" ? "Minimum" : "Minimum"}</label>
                <input
                  id="shop-price-min"
                  type="number"
                  min={catalogMinPrice}
                  max={catalogMaxPrice}
                  value={draftMin}
                  onChange={(event) => handleMinValue(event.target.value)}
                />
              </div>
              <div className="shop__price-range-field">
                <label htmlFor="shop-price-max">{lang === "tr" ? "Maksimum" : "Maximum"}</label>
                <input
                  id="shop-price-max"
                  type="number"
                  min={catalogMinPrice}
                  max={catalogMaxPrice}
                  value={draftMax}
                  onChange={(event) => handleMaxValue(event.target.value)}
                />
              </div>
            </div>

            <div className="shop__price-range-sliders">
              <label htmlFor="shop-price-min-slider">
                {lang === "tr" ? "Minimum kaydırıcı" : "Minimum slider"}
              </label>
              <input
                id="shop-price-min-slider"
                type="range"
                min={catalogMinPrice}
                max={catalogMaxPrice}
                step={sliderStep}
                value={draftMin}
                onChange={(event) => handleMinValue(event.target.value)}
              />

              <label htmlFor="shop-price-max-slider">
                {lang === "tr" ? "Maksimum kaydırıcı" : "Maximum slider"}
              </label>
              <input
                id="shop-price-max-slider"
                type="range"
                min={catalogMinPrice}
                max={catalogMaxPrice}
                step={sliderStep}
                value={draftMax}
                onChange={(event) => handleMaxValue(event.target.value)}
              />
            </div>

            <div className="shop__price-range-preview">
              {lang === "tr"
                ? `Seçili aralık: ${currencyFormatter.format(Math.min(draftMin, draftMax))} - ${currencyFormatter.format(Math.max(draftMin, draftMax))}`
                : `Selected range: ${currencyFormatter.format(Math.min(draftMin, draftMax))} - ${currencyFormatter.format(Math.max(draftMin, draftMax))}`}
            </div>

            <div className="shop__price-range-actions">
              <button type="button" className="tp-btn" onClick={applyCustomRange}>
                {lang === "tr" ? "Aralığı Uygula" : "Apply Range"}
              </button>
              <button type="button" className="tp-btn-border" onClick={resetCustomRange}>
                {lang === "tr" ? "Fiyatı Temizle" : "Clear Price"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPrice;

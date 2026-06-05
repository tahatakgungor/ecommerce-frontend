'use client';
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PriceItem from "./price-item";
import { useLanguage } from "src/context/LanguageContext";
import {
  buildShopRoute,
  createPricePresetRanges,
  getPriceUiBoundsFromRange,
  resolvePriceFilters,
} from "src/utils/shop-filters";

function clampPrice(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

const ShopPrice = ({ priceBounds }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const { min: catalogMinPrice, max: catalogMaxPrice } = useMemo(
    () => getPriceUiBoundsFromRange(Number(priceBounds?.min || 0), Number(priceBounds?.max || 0)),
    [priceBounds?.max, priceBounds?.min]
  );
  const actualMinPrice = Number(priceBounds?.min || 0);
  const actualMaxPrice = Number(priceBounds?.max || 0);
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
    () => createPricePresetRanges(actualMinPrice, actualMaxPrice),
    [actualMaxPrice, actualMinPrice]
  );
  const hasCatalogPrices = useMemo(
    () => actualMaxPrice > 0 || actualMinPrice > 0,
    [actualMaxPrice, actualMinPrice]
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
    if (!hasCatalogPrices) return;

    let nextMin = clampPrice(draftMin, catalogMinPrice, catalogMaxPrice);
    let nextMax = clampPrice(draftMax, catalogMinPrice, catalogMaxPrice);

    if (nextMin > nextMax) {
      [nextMin, nextMax] = [nextMax, nextMin];
    }

    const normalizedMin = nextMin <= actualMinPrice ? null : Math.round(nextMin);
    const normalizedMax = nextMax >= actualMaxPrice ? null : Math.round(nextMax);

    router.push(
      buildShopRoute(searchParams, {
        priceMin: normalizedMin,
        max: normalizedMax,
        priceMax: null,
        page: null,
      })
    );
  };

  const resetCustomRange = () => {
    setDraftMin(catalogMinPrice);
    setDraftMax(catalogMaxPrice);
    router.push(buildShopRoute(searchParams, { priceMin: null, max: null, priceMax: null, page: null }));
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
              <h6>{lang === "tr" ? "Fiyat Aralığı" : "Price Range"}</h6>
              {hasPriceFilter && (
                <span className="shop__price-range-badge" aria-live="polite">
                  {lang === "tr" ? "Uygulandı" : "Applied"}
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
                  step="1"
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
                  step="1"
                  value={draftMax}
                  onChange={(event) => handleMaxValue(event.target.value)}
                />
              </div>
            </div>

            <div className="shop__price-range-sliders">
              <label htmlFor="shop-price-min-slider">
                {lang === "tr" ? "Minimum" : "Minimum"}
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
                {lang === "tr" ? "Maksimum" : "Maximum"}
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
                ? `Seçilen aralık: ${currencyFormatter.format(Math.min(draftMin, draftMax))} - ${currencyFormatter.format(Math.max(draftMin, draftMax))}`
                : `Selected range: ${currencyFormatter.format(Math.min(draftMin, draftMax))} - ${currencyFormatter.format(Math.max(draftMin, draftMax))}`}
            </div>

            <div className="shop__price-range-actions">
              <button type="button" className="tp-btn" onClick={applyCustomRange}>
                {lang === "tr" ? "Uygula" : "Apply"}
              </button>
              <button type="button" className="tp-btn-border" onClick={resetCustomRange}>
                {lang === "tr" ? "Temizle" : "Clear"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPrice;

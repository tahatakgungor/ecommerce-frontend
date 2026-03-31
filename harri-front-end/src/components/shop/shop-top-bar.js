'use client';
import React from "react";
import { useLanguage } from "src/context/LanguageContext";
// internal
import { Dots, Lists } from "@svg/index";
import NiceSelect from "@ui/NiceSelect";

export function ShowingResult({ show, total }) {
  const { t, lang } = useLanguage();
  return (
    <div className="shop__result">
      <p>
        {lang === "tr"
          ? `${total} üründen 1–${show} arası gösteriliyor`
          : `Showing 1–${show} of ${total} results`}
      </p>
    </div>
  );
}

export function ShopShortTab({ handleTab }) {
  return (
    <div className="shop__sort-item">
      <div className="shop__sort-tab tp-tab">
        <nav>
          <div className="nav nav-tabs" id="nav-tab" role="tablist">
            <button
              onClick={() => handleTab('grid')}
              className="nav-link active"
              id="nav-grid-tab"
              data-bs-toggle="tab"
              data-bs-target="#nav-grid"
              type="button"
              role="tab"
              aria-controls="nav-grid"
              aria-selected="true"
              tabIndex='-1'
            >
              <Dots />
            </button>
            <button
              onClick={() => handleTab('lists')}
              className="nav-link"
              id="nav-list-tab"
              data-bs-toggle="tab"
              data-bs-target="#nav-list"
              type="button"
              role="tab"
              aria-controls="nav-list"
              aria-selected="false"
              tabIndex='-1'
            >
              <Lists />
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}

export function ShopShortSelect({ shortHandler }) {
  const { lang } = useLanguage();
  const options = lang === "tr"
    ? [
        { value: "Short Filtering",    text: "Sırala" },
        { value: "Latest Product",     text: "En Yeniler" },
        { value: "Price low to high",  text: "Fiyat: Düşükten Yükseğe" },
        { value: "Price high to low",  text: "Fiyat: Yüksekten Düşüğe" },
      ]
    : [
        { value: "Short Filtering",    text: "Sort by" },
        { value: "Latest Product",     text: "Latest Product" },
        { value: "Price low to high",  text: "Price low to high" },
        { value: "Price high to low",  text: "Price high to low" },
      ];

  return (
    <div className="shop__sort-item">
      <div className="shop__sort-select">
        <NiceSelect
          options={options}
          defaultCurrent={0}
          onChange={shortHandler}
          name="Sort by latest"
        />
      </div>
    </div>
  );
}

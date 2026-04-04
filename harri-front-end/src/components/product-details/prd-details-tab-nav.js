'use client';
import React from "react";
import { useLanguage } from "src/context/LanguageContext";

const PrdDetailsTabNav = ({ activeTab, onTabChange }) => {
  const { t } = useLanguage();
  return (
    <nav>
      <div className="product__details-tab-nav-inner nav tp-tab-menu d-flex flex-sm-nowrap flex-wrap">
        <button
          className={`nav-link ${activeTab === "description" ? "active" : ""}`}
          id="nav-desc-tab"
          type="button"
          onClick={() => onTabChange("description")}
        >
          {t('description')}
        </button>
        <button
          className={`nav-link ${activeTab === "reviews" ? "active" : ""}`}
          id="nav-reviews-tab"
          type="button"
          onClick={() => onTabChange("reviews")}
        >
          {t('reviews')}
        </button>
      </div>
    </nav>
  );
};

export default PrdDetailsTabNav;

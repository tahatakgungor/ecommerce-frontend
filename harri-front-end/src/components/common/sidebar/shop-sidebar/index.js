'use client';
import React from "react";
import { useRouter } from "next/navigation";
// internal
import ShopCategory from "../../shop-filtering/shop-category";
import ShopModel from "../../shop-filtering/shop-model";
import ShopPrice from "../../shop-filtering/shop-price";
import { useLanguage } from "src/context/LanguageContext";

const ShopSidebar = ({ brandOptions, categoryItems, priceBounds }) => {
  const router = useRouter();
  const { t } = useLanguage();
  const handleReset = () => {
    router.push("/shop");
  };
  return (
    <div className={`shop__sidebar on-left`}>
      <div className="shop__widget tp-accordion">
        <div className="accordion" id="shop_category">
          <ShopCategory categoryItems={categoryItems} />
        </div>
      </div>
      <div className="shop__widget tp-accordion">
        <ShopModel brandOptions={brandOptions} />
      </div>
      <div className="shop__widget tp-accordion">
        <div className="accordion" id="shop_price">
          <ShopPrice priceBounds={priceBounds} />
        </div>
      </div>
      <div className="shop__widget tp-accordion">
        <div className="accordion">
          <button onClick={handleReset} className="tp-btn w-100">
            {t("clearFilters")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopSidebar;

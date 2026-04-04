'use client';
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useLanguage } from "src/context/LanguageContext";
import { buildShopRoute, toFilterSlug } from "src/utils/shop-filters";

const ShopColor = ({ all_products }) => {
  const searchParams = useSearchParams();
  const color = searchParams.get("color");
  const router = useRouter();
  const { t, lang } = useLanguage();
  const all_colors = all_products.map((prd) => prd.colors.map((c) => c));
  const colors = [...new Set(all_colors.flat())];

  const handleColors = (value) => {
    const colorSlug = toFilterSlug(value);
    const route = buildShopRoute(searchParams, {
      color: toFilterSlug(color) === colorSlug ? null : colorSlug,
    });
    router.push(route);
  };

  return (
    <div className="accordion-item">
      <h2 className="accordion-header" id="color__widget">
        <button
          className="accordion-button"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#color_widget_collapse"
          aria-expanded="true"
          aria-controls="color_widget_collapse"
        >
          {lang === "tr" ? "Renk" : "Color"}
        </button>
      </h2>
      <div
        id="color_widget_collapse"
        className="accordion-collapse collapse show"
        aria-labelledby="color__widget"
        data-bs-parent="#shop_color"
      >
        <div className="accordion-body">
          <div className="shop__widget-list" style={{ height: "180px", overflowY: "auto" }}>
            {colors.map((clr, i) => (
              <div key={i} className={`shop__widget-list-item-2 has-${clr}`}>
                <input
                  type="checkbox"
                  id={`c-${clr}`}
                  checked={toFilterSlug(color) === toFilterSlug(clr) ? "checked" : false}
                  readOnly
                />
                <label
                  onClick={() => handleColors(clr)}
                  htmlFor={`c-${clr}`}
                  className="text-capitalize"
                >
                  {clr}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopColor;

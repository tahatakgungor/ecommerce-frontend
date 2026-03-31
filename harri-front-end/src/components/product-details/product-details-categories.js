'use client';
import React from "react";
import { useLanguage } from "src/context/LanguageContext";

const ProductDetailsCategories = ({name}) => {
  const { t } = useLanguage();
  return (
    <div className="product__details-categories product__details-more">
      <p>{t('category')}:</p>
      <span>
        <a href="#">{" "}{name}</a>
      </span>
    </div>
  );
};

export default ProductDetailsCategories;

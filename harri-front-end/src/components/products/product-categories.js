'use client';
import React from "react";
import { useLanguage } from "src/context/LanguageContext";
import { useSelector } from "react-redux";

const ProductCategories = () => {
  const { t } = useLanguage();
  const { product } = useSelector((state) => state.product);
  const categoryName = product?.category?.name;
  return (
    <div className="product__details-categories product__details-more">
      <p>{t('category')}:</p>
      <span>
        <a href="#">{categoryName || ""}</a>
      </span>
    </div>
  );
};

export default ProductCategories;

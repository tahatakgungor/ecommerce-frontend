'use client';
import React from 'react';
import { useLanguage } from "src/context/LanguageContext";

const ProductDetailsTags = ({ tag }) => {
  const { t } = useLanguage();
  return (
    <div className="product__details-tags">
      <span>{t('tags')}:</span>
      {tag?.map((item, i) => (
        <a key={i} href="#">
          {item}
        </a>
      ))}
    </div>
  );
};

export default ProductDetailsTags;

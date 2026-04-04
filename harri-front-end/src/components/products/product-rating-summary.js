'use client';
import React from "react";
import { useLanguage } from "src/context/LanguageContext";
import { useGetProductReviewSummaryQuery } from "src/redux/features/productApi";

const ProductRatingSummary = ({ productId, compact = false, className = "" }) => {
  const { lang } = useLanguage();
  const { data } = useGetProductReviewSummaryQuery(productId, { skip: !productId });

  const summary = data?.data || data || {};
  const average = Number(summary?.averageRating || 0);
  const totalReviews = Number(summary?.totalReviews || 0);
  const roundedStars = Math.round(average);

  return (
    <div className={`tp-rating-summary ${compact ? "tp-rating-summary--compact" : ""} ${className}`.trim()}>
      <div className="tp-rating-summary__stars" aria-label={`${average.toFixed(1)} / 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            <i className={star <= roundedStars ? "icon_star" : "icon_star_alt"}></i>
          </span>
        ))}
      </div>
      <div className="tp-rating-summary__meta">
        <span className="tp-rating-summary__avg">{average.toFixed(1)}</span>
        <span className="tp-rating-summary__count">
          ({totalReviews} {lang === "tr" ? "yorum" : "reviews"})
        </span>
      </div>
    </div>
  );
};

export default ProductRatingSummary;

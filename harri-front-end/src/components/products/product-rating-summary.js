'use client';
import React from "react";
import Link from "next/link";
import { useLanguage } from "src/context/LanguageContext";
import { useGetProductReviewSummaryQuery } from "src/redux/features/productApi";
import { getRatingVisualState } from "src/utils/rating-visual";

const ProductRatingSummary = ({
  productId,
  compact = false,
  className = "",
  linkCountToReviews = false,
}) => {
  const { lang } = useLanguage();
  const { data } = useGetProductReviewSummaryQuery(productId, { skip: !productId });

  const summary = data?.data || data || {};
  const { average, fullStars, showHalfOnFifthStar } = getRatingVisualState(summary?.averageRating);
  const totalReviews = Number(summary?.totalReviews || 0);
  const reviewHref = `/product-details/${productId}?tab=reviews#reviews`;

  return (
    <div className={`tp-rating-summary ${compact ? "tp-rating-summary--compact" : ""} ${className}`.trim()}>
      <div className="tp-rating-summary__stars" aria-label={`${average.toFixed(1)} / 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`tp-rating-summary__star ${showHalfOnFifthStar && star === 5 ? "tp-rating-summary__star--half" : ""}`.trim()}
          >
            {showHalfOnFifthStar && star === 5 ? (
              <>
                <i className="icon_star_alt tp-rating-summary__star-empty"></i>
                <i className="icon_star tp-rating-summary__star-fill"></i>
              </>
            ) : (
              <i className={star <= fullStars ? "icon_star" : "icon_star_alt"}></i>
            )}
          </span>
        ))}
      </div>
      <div className="tp-rating-summary__meta">
        <span className="tp-rating-summary__avg">{average.toFixed(1)}</span>
        {linkCountToReviews && productId ? (
          <Link href={reviewHref} className="tp-rating-summary__count tp-rating-summary__count-link">
            ({totalReviews} {lang === "tr" ? "yorum" : "reviews"})
          </Link>
        ) : (
          <span className="tp-rating-summary__count">
            ({totalReviews} {lang === "tr" ? "yorum" : "reviews"})
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductRatingSummary;

'use client';

import { useCallback } from "react";

export function buildReviewHref(productId) {
  return `/product-details/${productId}?tab=reviews#reviews`;
}

export default function useOpenReviews(productId) {
  const reviewHref = buildReviewHref(productId);

  const openReviews = useCallback((event) => {
    if (typeof window === "undefined") {
      return;
    }
    if (event?.preventDefault) {
      event.preventDefault();
    }
    const currentPath = window.location.pathname || "";
    const detailsPath = `/product-details/${productId}`;

    if (currentPath === detailsPath) {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", "reviews");
      url.hash = "reviews";
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
      window.dispatchEvent(new CustomEvent("product:open-reviews", { detail: { immediate: true } }));
      return;
    }

    window.location.href = reviewHref;
  }, [productId, reviewHref]);

  return { reviewHref, openReviews };
}

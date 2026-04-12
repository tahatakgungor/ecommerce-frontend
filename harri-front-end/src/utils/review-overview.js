export const getReviewedList = (overview) => {
  if (!overview || typeof overview !== "object") return [];

  const candidates = [
    overview.reviewed,
    overview.reviews,
    overview.myReviews,
    overview.reviewedProducts,
    overview.data?.reviewed,
    overview.data?.reviews,
    overview.result?.reviewed,
    overview.result?.reviews,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
};

export const getPendingList = (overview) => {
  if (!overview || typeof overview !== "object") return [];

  const candidates = [
    overview.pending,
    overview.pendingReviews,
    overview.toReview,
    overview.reviewable,
    overview.pendingProducts,
    overview.data?.pending,
    overview.data?.pendingReviews,
    overview.result?.pending,
    overview.result?.pendingReviews,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
};


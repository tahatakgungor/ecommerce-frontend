export type ReviewModerationStatus = "APPROVED" | "PENDING" | "REJECTED" | "UNKNOWN";

export type ReviewEntry = {
  productId: string;
  orderId: string;
  title: string;
  imageUrl: string | null;
  reviewId: string;
  rating: number;
  commentTitle: string;
  commentBody: string;
  mediaUrls: string[];
  status: ReviewModerationStatus;
  statusLabel: string;
  updatedAt: string;
  updatedAtText: string;
  hasReview: boolean;
};

export type ReviewOverview = {
  pending: ReviewEntry[];
  reviewed: ReviewEntry[];
};

export type ReviewMutationPayload = {
  rating: number;
  commentTitle: string;
  commentBody: string;
  orderId?: string;
  mediaUrls: string[];
};

export type RawReviewRow = {
  productId?: string;
  orderId?: string;
  title?: string;
  productTitle?: string;
  image?: string;
  productImage?: string;
  reviewId?: string;
  review?: {
    reviewId?: string;
    productId?: string;
    rating?: number;
    commentTitle?: string;
    commentBody?: string;
    mediaUrls?: string[];
    status?: string;
    updatedAt?: string;
  };
  rating?: number;
  commentTitle?: string;
  commentBody?: string;
  mediaUrls?: string[];
  status?: string;
  updatedAt?: string;
};

export type RawReviewOverview = {
  pending?: RawReviewRow[];
  pendingReviews?: RawReviewRow[];
  pendingProducts?: RawReviewRow[];
  reviewed?: RawReviewRow[];
  reviews?: RawReviewRow[];
  myReviews?: RawReviewRow[];
  data?: {
    pending?: RawReviewRow[];
    pendingReviews?: RawReviewRow[];
    reviewed?: RawReviewRow[];
    reviews?: RawReviewRow[];
  };
  result?: {
    pending?: RawReviewRow[];
    pendingReviews?: RawReviewRow[];
    reviewed?: RawReviewRow[];
    reviews?: RawReviewRow[];
  };
};

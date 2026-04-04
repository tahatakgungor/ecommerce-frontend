import { apiSlice } from "../api/apiSlice";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AdminReviewItem {
  reviewId: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  commentTitle?: string | null;
  commentBody: string;
  status: ReviewStatus;
  verifiedPurchase: boolean;
  mediaUrls: string[];
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminReviewListData {
  reviews: AdminReviewItem[];
  status: ReviewStatus;
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

interface ApiWrapped<T> {
  success: boolean;
  message?: string;
  data?: T;
  result?: T;
  total?: number;
}

const unwrap = <T>(response: ApiWrapped<T>): T => {
  return (response?.data || response?.result) as T;
};

export const reviewApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminReviews: builder.query<
      AdminReviewListData,
      { status?: ReviewStatus; page?: number; size?: number }
    >({
      query: ({ status = "PENDING", page = 0, size = 20 }) =>
        `/api/admin/reviews?status=${status}&page=${page}&size=${size}`,
      transformResponse: (response: ApiWrapped<AdminReviewListData>) => unwrap(response),
      providesTags: ["AllReviews"],
    }),
    updateAdminReviewStatus: builder.mutation<
      AdminReviewItem,
      { reviewId: string; status: Exclude<ReviewStatus, "PENDING"> }
    >({
      query: ({ reviewId, status }) => ({
        url: `/api/admin/reviews/${reviewId}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: ApiWrapped<AdminReviewItem>) => unwrap(response),
      invalidatesTags: ["AllReviews"],
    }),
    deleteAdminReview: builder.mutation<
      { message?: string } | void,
      { reviewId: string }
    >({
      query: ({ reviewId }) => ({
        url: `/api/admin/reviews/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AllReviews"],
    }),
  }),
});

export const {
  useGetAdminReviewsQuery,
  useUpdateAdminReviewStatusMutation,
  useDeleteAdminReviewMutation,
} = reviewApi;

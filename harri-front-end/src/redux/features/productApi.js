import { apiSlice } from "src/redux/api/apiSlice";

export const authApi = apiSlice.injectEndpoints({
  overrideExisting:true,
  endpoints: (builder) => ({
    // get showing products
    getShowingProducts: builder.query({
      query: () => `api/products/show`,
      providesTags: ["Products"],
      keepUnusedDataFor: 600,
    }),
    // get discount products
    getDiscountProducts: builder.query({
      query: () => `api/products/discount`,
      providesTags: ["Discount"],
      keepUnusedDataFor: 600,
    }),
    // get single product
    getProduct: builder.query({
      query: (id) => `api/products/${id}`,
      transformResponse: (response) => {
         // Unwrap ApiResponse if the backend wrapped it (e.g. { success, data })
         return response?.data || response?.result || response;
      },
      providesTags: (result, error, arg) => [{ type: "Product", id: arg }],
      invalidatesTags: (result, error, arg) => [
        { type: "RelatedProducts", id },
      ],
    }),
    // getRelatedProducts
    getRelatedProducts: builder.query({
      query: ({ id, tags }) => {
        const queryString = 
        `api/products/relatedProduct?tags=${tags ? tags.join(",") : ""}`;
        return queryString;
      },
      providesTags: (result, error, arg) => [
        { type: "RelatedProducts", id: arg.id },
      ],
      invalidatesTags: (result, error, arg) => [
        { type: "Product", id: arg.id },
      ],
    }),
    getProductReviews: builder.query({
      query: ({ productId, sort = "newest", withMedia = false, page = 0, size = 10 }) =>
        `api/products/${productId}/reviews?sort=${sort}&withMedia=${withMedia}&page=${page}&size=${size}`,
      providesTags: (result, error, { productId }) => [
        { type: "ProductReviews", id: productId },
      ],
    }),
    getProductReviewSummary: builder.query({
      query: (productId) => `api/products/${productId}/reviews/summary`,
      providesTags: (result, error, productId) => [
        { type: "ProductReviewSummary", id: productId },
      ],
      transformResponse: (response) => response?.data || response?.result || response,
    }),
    getProductReviewEligibility: builder.query({
      query: (arg) => {
        const productId = typeof arg === "object" ? arg?.productId : arg;
        const orderId = typeof arg === "object" ? arg?.orderId : undefined;
        const qs = orderId ? `?orderId=${orderId}` : "";
        return `api/products/${productId}/reviews/eligibility${qs}`;
      },
      providesTags: (result, error, arg) => {
        const productId = typeof arg === "object" ? arg?.productId : arg;
        return [
          { type: "ProductReviewEligibility", id: productId },
        ];
      },
      transformResponse: (response) => response?.data || response?.result || response,
    }),
    createProductReview: builder.mutation({
      query: ({ productId, data }) => ({
        url: `api/products/${productId}/reviews`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "ProductReviews", id: productId },
        { type: "ProductReviewSummary", id: productId },
        { type: "ProductReviewEligibility", id: productId },
      ],
    }),
    uploadReviewMedia: builder.mutation({
      query: ({ productId, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `api/products/${productId}/reviews/media-upload`,
          method: "POST",
          body: formData,
        };
      },
    }),
    voteProductReview: builder.mutation({
      query: ({ productId, reviewId, helpful }) => ({
        url: `api/products/${productId}/reviews/${reviewId}/vote`,
        method: "POST",
        body: { helpful },
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "ProductReviews", id: productId },
      ],
    }),
  }),
});

export const {
  useGetShowingProductsQuery,
  useGetDiscountProductsQuery,
  useGetProductQuery,
  useGetRelatedProductsQuery,
  useGetProductReviewsQuery,
  useGetProductReviewSummaryQuery,
  useGetProductReviewEligibilityQuery,
  useCreateProductReviewMutation,
  useUploadReviewMediaMutation,
  useVoteProductReviewMutation,
} = authApi;

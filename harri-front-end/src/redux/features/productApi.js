import { apiSlice } from "src/redux/api/apiSlice";
import { normalizeProductMedia } from "src/utils/media-url";

function normalizeProductCollections(response) {
  if (!response || typeof response !== "object") return response;
  if (Array.isArray(response.products)) {
    return {
      ...response,
      products: response.products.map((product) => normalizeProductMedia(product)),
    };
  }
  if (Array.isArray(response.product)) {
    return {
      ...response,
      product: response.product.map((product) => normalizeProductMedia(product)),
    };
  }
  if (Array.isArray(response.data)) {
    return {
      ...response,
      data: response.data.map((product) => normalizeProductMedia(product)),
    };
  }
  if (Array.isArray(response.result)) {
    return {
      ...response,
      result: response.result.map((product) => normalizeProductMedia(product)),
    };
  }
  return response;
}

export const authApi = apiSlice.injectEndpoints({
  overrideExisting:true,
  endpoints: (builder) => ({
    // get showing products
    getShowingProducts: builder.query({
      query: () => `api/products/show`,
      transformResponse: (response) => normalizeProductCollections(response),
      providesTags: ["Products"],
      keepUnusedDataFor: 600,
    }),
    // get discount products
    getDiscountProducts: builder.query({
      query: () => `api/products/discount`,
      transformResponse: (response) => normalizeProductCollections(response),
      providesTags: ["Discount"],
      keepUnusedDataFor: 600,
    }),
    // get popular products by type
    getPopularProducts: builder.query({
      query: ({ type = "top-rated", limit = 8 } = {}) => `api/products/popular?type=${type}&limit=${limit}`,
      transformResponse: (response) => normalizeProductCollections(response),
      providesTags: ["Products"],
      keepUnusedDataFor: 120,
    }),
    // get single product
    getProduct: builder.query({
      query: (id) => `api/products/${id}`,
      transformResponse: (response) => {
         // Unwrap ApiResponse if the backend wrapped it (e.g. { success, data })
         return normalizeProductMedia(response?.data || response?.result || response);
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
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          return response.map((product) => normalizeProductMedia(product));
        }
        return normalizeProductCollections(response);
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
    getMyReviewOverview: builder.query({
      query: () => `api/user/reviews/overview`,
      providesTags: ["MyReviewOverview"],
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
        "MyReviewOverview",
      ],
    }),
    updateProductReview: builder.mutation({
      query: ({ productId, reviewId, data }) => ({
        url: `api/products/${productId}/reviews/${reviewId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "ProductReviews", id: productId },
        { type: "ProductReviewSummary", id: productId },
        { type: "ProductReviewEligibility", id: productId },
        "MyReviewOverview",
      ],
    }),
    deleteOwnProductReview: builder.mutation({
      query: ({ productId, reviewId }) => ({
        url: `api/products/${productId}/reviews/${reviewId}/me`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "ProductReviews", id: productId },
        { type: "ProductReviewSummary", id: productId },
        { type: "ProductReviewEligibility", id: productId },
        "MyReviewOverview",
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
  useGetPopularProductsQuery,
  useGetProductQuery,
  useGetRelatedProductsQuery,
  useGetProductReviewsQuery,
  useGetProductReviewSummaryQuery,
  useGetProductReviewEligibilityQuery,
  useGetMyReviewOverviewQuery,
  useCreateProductReviewMutation,
  useUpdateProductReviewMutation,
  useDeleteOwnProductReviewMutation,
  useUploadReviewMediaMutation,
  useVoteProductReviewMutation,
} = authApi;

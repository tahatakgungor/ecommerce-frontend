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
  }),
});

export const {
  useGetShowingProductsQuery,
  useGetDiscountProductsQuery,
  useGetProductQuery,
  useGetRelatedProductsQuery,
} = authApi;

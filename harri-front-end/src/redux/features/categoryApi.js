import { apiSlice } from "src/redux/api/apiSlice";

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => `/api/category/all`,  // /show → /all
      providesTags: ["Category"],
      keepUnusedDataFor: 600,
    }),
  }),
});

export const { useGetCategoriesQuery } = authApi;
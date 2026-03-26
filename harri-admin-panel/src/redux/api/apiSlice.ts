import Cookies from "js-cookie";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers, { getState, endpoint }) => {
      try {
        const userInfo = Cookies.get("admin");
        if (userInfo) {
          const user = JSON.parse(userInfo);
          if (user?.accessToken) {
            headers.set("Authorization", `Bearer ${user.accessToken}`);
          }
        }
      } catch (error) {
        console.error("Error parsing user info:", error);
      }
      return headers;
    },
  }),
endpoints: (builder) => ({
    // 1. Tüm Ürünleri Getir (@GetMapping)
    getAllProducts: builder.query<any, void>({
      query: () => '/products',
      providesTags: ["AllProducts"],
    }),

    // 2. Tek Bir Ürün Getir (@GetMapping("/{id}"))
    getSingleProduct: builder.query<any, string>({
      query: (id) => `/products/${id}`,
      providesTags: ["SingleProduct"],
    }),

    // 3. Yeni Ürün Ekle (@PostMapping)
    addProduct: builder.mutation<any, any>({
      query: (data) => ({
        url: "/products",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AllProducts"],
    }),

    // 4. Ürün Sil (@DeleteMapping("/{id}"))
    deleteProduct: builder.mutation<any, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AllProducts"],
    }),
  }),
  tagTypes: [
    "DashboardAmount",
    "DashboardSalesReport",
    "DashboardMostSellingCategory",
    "DashboardRecentOrders",
    "AllProducts",
    "StockOutProducts",
    "AllCategory",
    "AllBrands",
    "getCategory",
    "AllOrders",
    "getBrand",
    "ReviewProducts",
    "AllCoupons",
    "Coupon",
    "AllStaff",
    "Stuff",
    "SingleProduct",
  ],
});
export const {
  useGetAllProductsQuery,
  useGetSingleProductQuery,
  useAddProductMutation,
  useDeleteProductMutation
} = apiSlice;

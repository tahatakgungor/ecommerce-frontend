import Cookies from "js-cookie";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // NOT: .env.local dosyan http://localhost:8081 olmalı.
    // Backend Controller'larında zaten "/api" olduğu için burada eklemiyoruz.
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
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
    // 1. Giriş Yap (Login) - Harri'nin admin paneline girmek için şart
    login: builder.mutation<any, any>({
      query: (data) => ({
        url: "/api/admin/login", // Backend: @RequestMapping("/api/admin") + @PostMapping("/login")
        method: "POST",
        body: data,
      }),
    }),

    // 2. Tüm Ürünleri Getir
    getAllProducts: builder.query<any, void>({
      query: () => '/api/products/all',
      // Backend artık Harri'nin dilini konuştuğu için transform'a gerek yok
      // Sadece gelen ApiResponse objesini olduğu gibi dönüyoruz
      transformResponse: (response: any) => response,
      providesTags: ["AllProducts"],
    }),
    // 3. Tek Bir Ürün Getir
    getSingleProduct: builder.query<any, string>({
      query: (id) => `/api/products/${id}`,
      transformResponse: (response: any) => response.data,
      providesTags: ["SingleProduct"],
    }),

    // 4. Yeni Ürün Ekle
    addProduct: builder.mutation<any, any>({
      query: (data) => ({
        url: "/api/products", // Backend: @PostMapping
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AllProducts"],
    }),

    // 5. Ürün Sil
    deleteProduct: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/products/${id}`, // Backend: @DeleteMapping("/{id}")
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
  useLoginMutation,
  useGetAllProductsQuery,
  useGetSingleProductQuery,
  useAddProductMutation,
  useDeleteProductMutation,
} = apiSlice;
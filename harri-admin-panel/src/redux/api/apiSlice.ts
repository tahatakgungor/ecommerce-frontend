import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/redux/store";

const readCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const accessToken = (getState() as RootState)?.auth?.accessToken;
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      const csrfToken = readCookie("XSRF-TOKEN");
      if (csrfToken) {
        headers.set("X-XSRF-TOKEN", csrfToken);
      }
      return headers;
    },
  }),
    // apiSlice.ts dosyasındaki tagTypes kısmını bu şekilde güncelle:
    tagTypes: [
      "AllProducts",
      "SingleProduct",
      "AllCategory",
      "getCategory",
      "AllBrands",
      "getBrand",          // <-- Hata veren buydu, ekledik
      "DashboardAmount",
      "DashboardSalesReport",
      "DashboardMostSellingCategory",
      "DashboardRecentOrders",
      "AllStaff",
      "AllCoupons",
      "AllReviews",
      "AllOrders",
      "ActivityLogs",
      "ContactMessages",
      "AllUsers",
      "AllBanners",
      "AllBlogs",
      "SiteSettings",
      "OrderReturns",
      "Stuff",
      "Coupon",            // Muhtemel hata verecek olanları da ekledim
      "Review",            // Muhtemel
      "Order",             // Muhtemel
      "User"               // Muhtemel
    ],
  endpoints: (builder) => ({
    // 1. Giriş Yap (Login)
    login: builder.mutation<any, any>({
      query: (data) => ({
        url: "/api/admin/login",
        method: "POST",
        body: data,
      }),
    }),

    // 2. Dashboard - Kart Verileri
    getDashboardAmount: builder.query<any, void>({
      query: () => "/api/user-order/dashboard-amount",
      providesTags: ["DashboardAmount"],
    }),

    // 3. Dashboard - Satış Raporu (Grafik)
    getDashboardSalesReport: builder.query<any, void>({
      query: () => "/api/user-order/sales-report",
      providesTags: ["DashboardSalesReport"],
    }),

    // 4. Dashboard - En Çok Satan Kategoriler
    getDashboardMostSellingCategory: builder.query<any, void>({
      query: () => "/api/user-order/most-selling-category",
      providesTags: ["DashboardMostSellingCategory"],
    }),

    // 5. Dashboard - Son Siparişler
    getDashboardRecentOrders: builder.query<any, void>({
      query: () => "/api/user-order/dashboard-recent-order",
      providesTags: ["DashboardRecentOrders"],
    }),

    // 6. Ürünleri Getir
    getAllProducts: builder.query<any, void>({
      query: () => "/api/products/all",
      providesTags: ["AllProducts"],
    }),

    // 7. Ürün Ekle
    addProduct: builder.mutation<any, any>({
      query: (data) => ({
        url: "/api/products/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AllProducts"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetDashboardAmountQuery,
  useGetDashboardSalesReportQuery,
  useGetDashboardMostSellingCategoryQuery,
  useGetDashboardRecentOrdersQuery,
  useGetAllProductsQuery,
  useAddProductMutation,
} = apiSlice;

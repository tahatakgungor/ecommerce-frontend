import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/redux/store";
import { notifyError } from "@/utils/toast";
import { userLoggedOut } from "@/redux/auth/authSlice";
import { isAdminPublicPath } from "@/utils/auth-routes";

const API_REDUCER_PATH = "api";
let didNotifySessionExpired = false;

const readCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
};

const rawBaseQuery = fetchBaseQuery({
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
});

const isAuthEndpoint = (args: string | FetchArgs) => {
  const endpoint = typeof args === "string" ? args : args.url;
  return [
    "/api/admin/login",
    "/api/admin/register",
    "/api/admin/forget-password",
    "/api/admin/confirm-forget-password",
  ].some((path) => endpoint.includes(path));
};

const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const status = result?.error?.status;
  const isUnauthorized = status === 401 || status === 403;

  if (isUnauthorized && !isAuthEndpoint(args)) {
    api.dispatch(userLoggedOut());
    api.dispatch({ type: `${API_REDUCER_PATH}/resetApiState` });

    if (typeof window !== "undefined") {
      if (!didNotifySessionExpired) {
        notifyError("Oturum süreniz doldu, lütfen tekrar giriş yapın.");
        didNotifySessionExpired = true;
        window.setTimeout(() => {
          didNotifySessionExpired = false;
        }, 3500);
      }

      const currentPath = window.location.pathname;
      if (!isAdminPublicPath(currentPath)) {
        window.location.replace("/login");
      }
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: API_REDUCER_PATH,
  baseQuery: baseQueryWithAuth,
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

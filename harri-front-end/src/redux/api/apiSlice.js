import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include", // httpOnly cookie'yi her istekte gönder
    prepareHeaders: async (headers, { getState }) => {
      // Redux'ta token varsa (in-memory) Authorization header ekle
      // httpOnly cookie da paralel çalışır (sayfa yenilemede cookie devreye girer)
      const token = getState()?.auth?.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const csrfToken = readCookie("XSRF-TOKEN");
      if (csrfToken) {
        headers.set("X-XSRF-TOKEN", csrfToken);
      }
      return headers;
    },
  }),
  tagTypes: ["Category", "Products", "Discount", "Coupon", "Product", "RelatedProducts", "ProductReviews", "ProductReviewSummary", "ProductReviewEligibility", "Banners"],
  endpoints: (builder) => ({}),
});

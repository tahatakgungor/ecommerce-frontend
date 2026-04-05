import { apiSlice } from "../api/apiSlice";

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  imageUrl: string;
  imageAlt?: string | null;
  active: boolean;
  openInNewTab: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiWrapped<T> {
  success: boolean;
  data?: T;
  result?: T;
  message?: string;
}

const unwrap = <T>(response: ApiWrapped<T>): T => {
  return (response?.data || response?.result) as T;
};

export const bannerApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminBanners: builder.query<BannerItem[], void>({
      query: () => "/api/admin/banners",
      transformResponse: (response: ApiWrapped<BannerItem[]>) => unwrap(response),
      providesTags: ["AllBanners"],
    }),
    createBanner: builder.mutation<BannerItem, Partial<BannerItem>>({
      query: (data) => ({
        url: "/api/admin/banners",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiWrapped<BannerItem>) => unwrap(response),
      invalidatesTags: ["AllBanners"],
    }),
    updateBanner: builder.mutation<BannerItem, { id: string; data: Partial<BannerItem> }>({
      query: ({ id, data }) => ({
        url: `/api/admin/banners/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiWrapped<BannerItem>) => unwrap(response),
      invalidatesTags: ["AllBanners"],
    }),
    toggleBanner: builder.mutation<BannerItem, { id: string; active: boolean }>({
      query: ({ id, active }) => ({
        url: `/api/admin/banners/${id}/toggle?active=${active}`,
        method: "PATCH",
      }),
      transformResponse: (response: ApiWrapped<BannerItem>) => unwrap(response),
      invalidatesTags: ["AllBanners"],
    }),
    deleteBanner: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/api/admin/banners/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AllBanners"],
    }),
  }),
});

export const {
  useGetAdminBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useToggleBannerMutation,
  useDeleteBannerMutation,
} = bannerApi;

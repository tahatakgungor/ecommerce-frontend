import { apiSlice } from "@/redux/api/apiSlice";

type SiteSettingsPayload = {
  announcementActive?: boolean;
  announcementTextTr?: string;
  announcementTextEn?: string;
  announcementLink?: string;
  announcementSpeed?: number;
  whatsappNumber?: string;
  whatsappLabel?: string;
  supportEmail?: string;
  supportPhone?: string;
  returnWindowDays?: number;
  freeShippingThreshold?: number;
  defaultShippingFee?: number;
};

export const siteSettingsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminSiteSettings: builder.query<any, void>({
      query: () => "/api/admin/site-settings",
      providesTags: ["SiteSettings"],
    }),
    updateAdminSiteSettings: builder.mutation<any, SiteSettingsPayload>({
      query: (body) => ({
        url: "/api/admin/site-settings",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["SiteSettings"],
    }),
  }),
});

export const {
  useGetAdminSiteSettingsQuery,
  useUpdateAdminSiteSettingsMutation,
} = siteSettingsApi;

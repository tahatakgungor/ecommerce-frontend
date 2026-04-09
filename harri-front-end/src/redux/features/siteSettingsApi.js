import { apiSlice } from "../api/apiSlice";

export const siteSettingsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getSiteSettings: builder.query({
      query: () => "/api/site-settings",
      providesTags: ["SiteSettings"],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetSiteSettingsQuery } = siteSettingsApi;

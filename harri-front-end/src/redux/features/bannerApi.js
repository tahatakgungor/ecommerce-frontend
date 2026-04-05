import { apiSlice } from "src/redux/api/apiSlice";
import { normalizeMediaUrl } from "src/utils/media-url";

const normalizeBanner = (banner) => {
  if (!banner || typeof banner !== "object") return banner;
  return {
    ...banner,
    imageUrl: normalizeMediaUrl(banner.imageUrl),
  };
};

export const bannerApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getShowingBanners: builder.query({
      query: () => `api/banners/show`,
      transformResponse: (response) => {
        const banners = Array.isArray(response?.banners) ? response.banners : [];
        return {
          ...response,
          banners: banners.map(normalizeBanner),
        };
      },
      providesTags: ["Banners"],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetShowingBannersQuery } = bannerApi;

import { apiSlice } from "../api/apiSlice";

export interface NewsletterSubscriber {
  id: number;
  email: string;
  subscribedAt?: string | null;
}

interface NewsletterListData {
  subscribers: NewsletterSubscriber[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

interface ApiWrapped<T> {
  success: boolean;
  message?: string;
  data?: T;
  result?: T;
}

const unwrap = <T>(response: ApiWrapped<T>): T => {
  return (response?.data || response?.result) as T;
};

export const newsletterApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getNewsletterSubscribers: builder.query<
      NewsletterListData,
      { page?: number; size?: number }
    >({
      query: ({ page = 0, size = 20 }) =>
        `/api/admin/newsletter?page=${page}&size=${size}`,
      transformResponse: (response: ApiWrapped<NewsletterListData>) => unwrap(response),
      providesTags: ["AllUsers"],
    }),
    deleteNewsletterSubscriber: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `/api/admin/newsletter/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AllUsers"],
    }),
  }),
});

export const {
  useGetNewsletterSubscribersQuery,
  useDeleteNewsletterSubscriberMutation,
} = newsletterApi;

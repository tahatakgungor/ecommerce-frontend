import { apiSlice } from "@/redux/api/apiSlice";

export const contactApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getContactMessages: builder.query<any, { status?: string; page?: number; size?: number } | void>({
      query: (params) => {
        const query = new URLSearchParams();
        if (params && typeof params === "object") {
          if (params.status && params.status !== "ALL") query.set("status", params.status);
          if (params.page) query.set("page", String(params.page));
          if (params.size) query.set("size", String(params.size));
        }
        const suffix = query.toString() ? `?${query.toString()}` : "";
        return `/api/admin/contact-messages${suffix}`;
      },
      providesTags: ["ContactMessages"],
      keepUnusedDataFor: 60,
    }),
    updateContactMessageStatus: builder.mutation<any, { id: string; status: string; adminNote?: string }>({
      query: ({ id, status, adminNote }) => ({
        url: `/api/admin/contact-messages/${id}/status`,
        method: "PATCH",
        body: { status, adminNote },
      }),
      invalidatesTags: ["ContactMessages", "ActivityLogs"],
    }),
  }),
});

export const { useGetContactMessagesQuery, useUpdateContactMessageStatusMutation } = contactApi;

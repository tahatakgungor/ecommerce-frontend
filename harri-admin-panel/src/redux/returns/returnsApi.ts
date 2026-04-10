import { apiSlice } from "@/redux/api/apiSlice";

export const returnsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminReturns: builder.query<any, void>({
      query: () => "/api/admin/returns",
      providesTags: ["OrderReturns"],
    }),
    updateReturnStatus: builder.mutation<any, { id: string; status: string; adminNote?: string }>({
      query: ({ id, status, adminNote }) => ({
        url: `/api/admin/returns/${id}/status`,
        method: "PATCH",
        body: { status, adminNote },
      }),
      invalidatesTags: ["OrderReturns", "AllOrders"],
    }),
  }),
});

export const { useGetAdminReturnsQuery, useUpdateReturnStatusMutation } = returnsApi;

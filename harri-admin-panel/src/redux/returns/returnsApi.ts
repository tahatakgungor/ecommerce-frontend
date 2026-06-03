import { apiSlice } from "@/redux/api/apiSlice";
import { buildAdminListQueryParams } from "@/utils/admin-list-query";

type AdminReturnListQuery = {
  status?: string;
  q?: string;
  page?: number;
  size?: number;
};

export const returnsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminReturns: builder.query<any, AdminReturnListQuery | void>({
      query: (params) => ({
        url: "/api/admin/returns",
        params: buildAdminListQueryParams(params || {}),
      }),
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

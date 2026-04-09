import { apiSlice } from "../api/apiSlice";

export const authApi = apiSlice.injectEndpoints({
  overrideExisting:true,
  endpoints: (builder) => ({
    // getUserOrders
    getUserOrders: builder.query({
      query: () => `/api/user-order/order-by-user`,
      keepUnusedDataFor: 600,
    }),
    // getUserOrders
    getUserOrderById: builder.query({
      query: (id) => `/api/user-order/single-order/${id}`,
      keepUnusedDataFor: 600,
    }),
    createOrderReturn: builder.mutation({
      query: ({ orderId, reason, customerNote }) => ({
        url: `/api/user-order/${orderId}/returns`,
        method: "POST",
        body: { reason, customerNote },
      }),
    }),
    getMyOrderReturns: builder.query({
      query: () => `/api/user-order/returns`,
      keepUnusedDataFor: 120,
    }),
  }),
});

export const {
  useGetUserOrdersQuery,
  useGetUserOrderByIdQuery,
  useCreateOrderReturnMutation,
  useGetMyOrderReturnsQuery,
} = authApi;

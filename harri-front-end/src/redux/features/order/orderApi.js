import { safeRemoveItem } from "src/utils/localstorage";
import { apiSlice } from "../../api/apiSlice";
import { set_iyzico_checkout, clear_iyzico_checkout } from "./orderSlice";

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    initializePayment: builder.mutation({
      query: (data) => ({
        url: "api/order/initialize-payment",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(
            set_iyzico_checkout({
              checkoutFormContent: result?.data?.checkoutFormContent || "",
              token: result?.data?.token || "",
              conversationId: result?.data?.conversationId || "",
            })
          );
        } catch (err) {
          // handled in hook
        }
      },
    }),
    confirmPayment: builder.mutation({
      query: (data) => ({
        url: "api/order/confirm-payment",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result) {
            safeRemoveItem("couponInfo");
            safeRemoveItem("cart_products");
            safeRemoveItem("shipping_info");
            dispatch(clear_iyzico_checkout());
          }
        } catch (err) {
          // handled in hook
        }
      },
    }),
    lookupOrder: builder.query({
      query: ({ invoice, email }) => ({
        url: `api/order/lookup?invoice=${invoice}&email=${email}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useInitializePaymentMutation, useConfirmPaymentMutation, useLookupOrderQuery, useLazyLookupOrderQuery } = authApi;

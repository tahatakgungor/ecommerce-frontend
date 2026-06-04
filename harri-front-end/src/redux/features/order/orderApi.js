import { safeRemoveItem, safeSetItem } from "src/utils/localstorage";
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
          const conversationId = result?.data?.conversationId || "";
          const confirmationToken = result?.data?.confirmationToken || "";
          if (conversationId) {
            safeSetItem("iyzico_conversation_id", conversationId);
            safeSetItem("iyzico_pending_order", conversationId);
          }
          if (confirmationToken) {
            safeSetItem("iyzico_confirmation_token", confirmationToken);
          }
          dispatch(
            set_iyzico_checkout({
              checkoutFormContent: result?.data?.checkoutFormContent || "",
              token: result?.data?.token || "",
              conversationId,
              confirmationToken,
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
            safeRemoveItem("iyzico_confirmation_token");
            dispatch(clear_iyzico_checkout());
          }
        } catch (err) {
          // handled in hook
        }
      },
    }),
    lookupOrder: builder.query({
      query: ({ invoice, email }) => ({
        url: `api/order/lookup?invoice=${encodeURIComponent(invoice || "")}&email=${encodeURIComponent(email || "")}`,
        method: "GET",
      }),
    }),
    viewOrder: builder.query({
      query: ({ token }) => ({
        url: `api/order/view?token=${encodeURIComponent(token || "")}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useInitializePaymentMutation, useConfirmPaymentMutation, useLookupOrderQuery, useLazyLookupOrderQuery, useViewOrderQuery } = authApi;

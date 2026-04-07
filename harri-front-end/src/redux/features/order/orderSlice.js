import { safeGetItem, safeSetItem } from "src/utils/localstorage";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shipping_info: {},
  iyzico_checkout_form_content: "",
  iyzico_token: "",
  iyzico_conversation_id: "",
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    set_shipping: (state, { payload }) => {
      state.shipping_info = payload;
      safeSetItem("shipping_info", JSON.stringify(payload));
    },
    get_shipping: (state) => {
      const data = safeGetItem("shipping_info");
      if (data) {
        state.shipping_info = JSON.parse(data);
      } else {
        state.shipping_info = {};
      }
    },
    set_iyzico_checkout: (state, { payload }) => {
      state.iyzico_checkout_form_content = payload.checkoutFormContent || "";
      state.iyzico_token = payload.token || "";
      state.iyzico_conversation_id = payload.conversationId || "";
    },
    clear_iyzico_checkout: (state) => {
      state.iyzico_checkout_form_content = "";
      state.iyzico_token = "";
      state.iyzico_conversation_id = "";
    },
  },
});

export const { get_shipping, set_shipping, set_iyzico_checkout, clear_iyzico_checkout } = orderSlice.actions;
export default orderSlice.reducer;

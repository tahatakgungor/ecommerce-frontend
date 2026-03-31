import { createSlice } from "@reduxjs/toolkit";

const isBrowser = typeof window !== "undefined";

const initialState = {
  shipping_info: {},
  stripe_client_secret: "",
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    set_shipping: (state, { payload }) => {
      state.shipping_info = payload;
      if (isBrowser) {
        localStorage.setItem("shipping_info", JSON.stringify(payload));
      }
    },
    get_shipping: (state) => {
      if (!isBrowser) return;
      const data = localStorage.getItem("shipping_info");
      if (data) {
        state.shipping_info = JSON.parse(data);
      } else {
        state.shipping_info = {};
      }
    },
    set_client_secret: (state, { payload }) => {
      state.stripe_client_secret = payload;
    },
  },
});

export const { get_shipping, set_shipping, set_client_secret } = orderSlice.actions;
export default orderSlice.reducer;

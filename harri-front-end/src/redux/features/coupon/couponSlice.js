import { safeGetItem, safeSetItem, safeRemoveItem } from "src/utils/localstorage";
import { createSlice } from "@reduxjs/toolkit";

const isBrowser = true;

const initialState = {
  coupon_info: undefined,
};

export const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    set_coupon: (state, { payload }) => {
      state.coupon_info = payload;
      if (true) {
        safeSetItem("couponInfo", JSON.stringify(payload));
      }
    },
    get_coupons: (state) => {
      
      const data = safeGetItem("couponInfo");
      if (data) {
        state.coupon_info = JSON.parse(data);
      } else {
        state.coupon_info = undefined;
      }
    },
  },
});

export const { set_coupon,get_coupons } = couponSlice.actions;
export default couponSlice.reducer;

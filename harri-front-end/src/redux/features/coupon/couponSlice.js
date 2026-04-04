import { safeGetItem, safeSetItem, safeRemoveItem } from "src/utils/localstorage";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  coupon_info: undefined,
};

export const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    set_coupon: (state, { payload }) => {
      const nextCoupon = {
        ...payload,
        appliedByEmail: payload?.appliedByEmail || null,
      };
      state.coupon_info = nextCoupon;
      safeSetItem("couponInfo", JSON.stringify(nextCoupon));
    },
    get_coupons: (state, { payload }) => {
      const data = safeGetItem("couponInfo");
      if (data) {
        const coupon = JSON.parse(data);
        const currentUserEmail = payload?.currentUserEmail?.trim()?.toLowerCase?.() || null;
        const appliedByEmail = coupon?.appliedByEmail?.trim?.()?.toLowerCase?.() || null;

        if (appliedByEmail && currentUserEmail !== appliedByEmail) {
          state.coupon_info = undefined;
          safeRemoveItem("couponInfo");
          return;
        }

        state.coupon_info = coupon;
      } else {
        state.coupon_info = undefined;
      }
    },
    clear_coupon: (state) => {
      state.coupon_info = undefined;
      safeRemoveItem("couponInfo");
    },
  },
});

export const { set_coupon,get_coupons, clear_coupon } = couponSlice.actions;
export default couponSlice.reducer;

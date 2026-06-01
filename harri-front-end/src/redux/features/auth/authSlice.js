import { safeGetItem, safeRemoveItem } from "src/utils/localstorage";
import { createSlice } from "@reduxjs/toolkit";

// Oturum için httpOnly cookie birincil kaynaktır.
// Güvenlik gereği access token localStorage'da kalıcı tutulmaz.
const loadUserFromStorage = () => {
  try {
    const stored = safeGetItem("user_profile");
    if (stored) {
      return {
        accessToken: undefined,
        user: JSON.parse(stored),
      };
    }
  } catch (_) {}
  return { accessToken: undefined, user: undefined };
};

const initialState = loadUserFromStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, { payload }) => {
      if (payload?.accessToken !== undefined) {
        state.accessToken = payload.accessToken;
      }
      if (payload?.user !== undefined) {
        state.user = payload.user;
      }
    },
    userLoggedOut: (state) => {
      state.accessToken = undefined;
      state.user = undefined;
      safeRemoveItem("user_profile");
      safeRemoveItem("couponInfo");
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;

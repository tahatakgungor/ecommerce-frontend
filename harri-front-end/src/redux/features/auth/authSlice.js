import { safeGetItem, safeSetItem, safeRemoveItem } from "src/utils/localstorage";
import { createSlice } from "@reduxjs/toolkit";

const loadAuthFromStorage = () => {
  try {
    const stored = safeGetItem("auth");
    if (stored) return JSON.parse(stored);
  } catch (_) {}
  return { accessToken: undefined, user: undefined };
};

const initialState = loadAuthFromStorage();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, { payload }) => {
      state.accessToken = payload.accessToken;
      state.user = payload.user;
    },
    userLoggedOut: (state) => {
      state.accessToken = undefined;
      state.user = undefined;
      safeRemoveItem("auth")
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// IUser tipini orijinal MongoDB standartına ( _id ) geri döndürdük
export type IUser = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  image?: string;
  phone?: string;
};

export type IAuth = {
  accessToken: string | undefined;
  user: IUser | undefined;
};

const initialAuthState: IAuth = {
  accessToken: undefined,
  user: undefined,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    userLoggedIn: (state, { payload }: PayloadAction<IAuth>) => {
      state.accessToken = payload.accessToken;
      state.user = payload.user;
    },
    userLoggedOut: (state) => {
      state.accessToken = undefined;
      state.user = undefined;
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;

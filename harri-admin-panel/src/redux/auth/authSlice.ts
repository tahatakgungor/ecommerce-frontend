import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

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

const cookieData = Cookies.get("admin");

let initialAuthState: IAuth = {
  accessToken: undefined,
  user: undefined,
};

if (cookieData) {
  try {
    const parsedData: IAuth = JSON.parse(cookieData);
    initialAuthState = {
      accessToken: parsedData.accessToken,
      user: parsedData.user,
    };
  } catch (error) {
    console.error("Cookie parse hatası:", error);
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    userLoggedIn: (state, { payload }: PayloadAction<IAuth>) => {
      state.accessToken = payload.accessToken;
      state.user = payload.user;
      Cookies.set("admin", JSON.stringify(payload), { expires: 7 });
    },
    userLoggedOut: (state) => {
      state.accessToken = undefined;
      state.user = undefined;
      Cookies.remove("admin");
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
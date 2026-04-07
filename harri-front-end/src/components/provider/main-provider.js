"use client";
import { Provider } from "react-redux";
import { store } from "src/redux/store";
import { LanguageProvider } from "src/context/LanguageContext";
if (typeof window !== "undefined") {
  require("bootstrap/dist/js/bootstrap");
}

export default function MainProvider({ children }) {
  return (
    <Provider store={store}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </Provider>
  );
}

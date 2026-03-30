"use client";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Provider } from "react-redux";
import { store } from "src/redux/store";
import { LanguageProvider } from "src/context/LanguageContext";
if (typeof window !== "undefined") {
  require("bootstrap/dist/js/bootstrap");
}

// stripePromise
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

export default function MainProvider({ children }) {
  return (
    <Provider store={store}>
      <LanguageProvider>
        <Elements stripe={stripePromise}>{children}</Elements>
      </LanguageProvider>
    </Provider>
  );
}

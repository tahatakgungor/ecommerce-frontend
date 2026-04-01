import React, { useState } from "react";
import { CardElement } from "@stripe/react-stripe-js";
import { useLanguage } from "src/context/LanguageContext";

const PaymentCardElement = ({ stripe, cardError, cart_products,isCheckoutSubmit }) => {
  const { t } = useLanguage();
  return (
    <div className="my-2">
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#9e2146",
            },
          },
        }}
      />
      <div className="order-button-payment mt-25">
        <button
          type="submit"
          className="tp-btn"
          disabled={!stripe || cart_products.length === 0 || isCheckoutSubmit}
        >
          {isCheckoutSubmit ? t('processing') || "İşleniyor..." : t('placeOrder')}
        </button>
      </div>
      {cardError && (
        <p className="mt-15" style={{ color: "red" }}>
          {cardError}
        </p>
      )}
    </div>
  );
};

export default PaymentCardElement;

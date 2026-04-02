import React from "react";
import { createPortal } from "react-dom";
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
          {t('placeOrder')}
        </button>
      </div>
      {cardError && (
        <p className="mt-15" style={{ color: "red" }}>
          {cardError}
        </p>
      )}
      {isCheckoutSubmit && createPortal(
        <div style={{position:'fixed',inset:0,zIndex:999999,background:'rgba(0,0,0,0.35)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'wait',pointerEvents:'all'}}>
          <div style={{width:54,height:54,border:'5px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'checkoutSpin 0.75s linear infinite'}} />
          <style>{'@keyframes checkoutSpin{to{transform:rotate(360deg)}}'}</style>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PaymentCardElement;

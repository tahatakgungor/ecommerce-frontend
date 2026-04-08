'use client';
import React from "react";
// internal
import OrderLookupForm from "@components/forms/order-lookup-form";
import { useLanguage } from "src/context/LanguageContext";

const OrderLookupArea = () => {
  const { lang } = useLanguage();
  return (
    <section className="login__area pt-110 pb-110">
      <div className="container">
        <div className="login__inner p-relative z-index-1">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8 col-md-10">
              <div className="login__wrapper">
                <div className="login__top mb-30 text-center">
                  <h3 className="login__title">
                    {lang === "tr" ? "Sipariş Takibi" : "Order Tracking"}
                  </h3>
                  <p className="text-muted mt-2">
                    {lang === "tr" 
                      ? "Fatura numaranız ve e-posta adresiniz ile sipariş durumunuzu sorgulayabilirsiniz." 
                      : "Lookup your order status using your invoice number and email address."}
                  </p>
                </div>
                <div className="login__form">
                  <OrderLookupForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderLookupArea;

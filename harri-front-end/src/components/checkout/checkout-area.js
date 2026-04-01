'use client';
import React, { useState } from "react";
// internal
import BillingDetails from "./billing-details";
import OrderArea from "./order-area";
import { useLanguage } from "src/context/LanguageContext";

const CheckoutArea = ({handleSubmit,submitHandler,...others}) => {
  const { t } = useLanguage();
  return (
    <section className="checkout-area pb-85">
      <div className="container">
        <form onSubmit={handleSubmit(submitHandler)}>
          <div className="row">
            <div className="col-lg-6">
              <div className="checkbox-form">
                <h3>{t('billingDetails')}</h3>
                {/* billing details start*/}
                <BillingDetails {...others} />
                {/* billing details end*/}
              </div>
            </div>
            <div className="col-lg-6">
              {/* order area start */}
              <OrderArea
                {...others}
              />
              {/* order area end */}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CheckoutArea;

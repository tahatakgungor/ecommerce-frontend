'use client';
import React from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
// internal
import BillingDetails from "./billing-details";
import OrderArea from "./order-area";
import { useLanguage } from "src/context/LanguageContext";
import { clear_cart } from "src/redux/features/cartSlice";
import { clear_coupon } from "src/redux/features/coupon/couponSlice";
import { notifySuccess } from "@utils/toast";

const CheckoutArea = ({handleSubmit,submitHandler,...others}) => {
  const dispatch = useDispatch();
  const { t } = useLanguage();

  const handleClearCart = () => {
    const confirmed = window.confirm(t("clearCartConfirm"));
    if (!confirmed) return;
    dispatch(clear_cart());
    dispatch(clear_coupon());
    notifySuccess(t("clearCartSuccess"));
  };

  return (
    <section className="checkout-area pb-85">
      <div className="container">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-20">
          <Link href="/cart" style={{ color: "#555", fontSize: "14px" }}>
            <i className="fal fa-reply me-1"></i> {t("viewCart")}
          </Link>
          <button type="button" onClick={handleClearCart} className="tp-btn-border">
            {t("clearCart")}
          </button>
        </div>
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

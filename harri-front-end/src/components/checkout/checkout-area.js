'use client';
import React from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
// internal
import BillingDetails from "./billing-details";
import OrderArea from "./order-area";
import IyzicoCheckoutModal from "@components/order/iyzico-checkout-modal";
import { useLanguage } from "src/context/LanguageContext";
import { clear_cart } from "src/redux/features/cartSlice";
import { clear_coupon } from "src/redux/features/coupon/couponSlice";
import { notifySuccess } from "@utils/toast";

const CheckoutArea = ({ handleSubmit, submitHandler, showIyzicoModal, checkoutFormContent, closeIyzicoModal, ...others }) => {
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
              {!showIyzicoModal ? (
                <div className="checkbox-form">
                  <h3>{t('billingDetails')}</h3>
                  <BillingDetails {...others} />
                </div>
              ) : (
                <div className="iyzico-inline-container mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h3 className="m-0" style={{ fontSize: "20px" }}>
                      {t('payment') || "Ödeme"}
                    </h3>
                    <button 
                      type="button" 
                      onClick={closeIyzicoModal}
                      className="tp-btn-border btn-sm"
                      style={{ padding: "4px 16px", fontSize: "13px" }}
                    >
                      <i className="fal fa-arrow-left me-2"></i>
                      {t('back') || "Geri Dön"}
                    </button>
                  </div>
                  
                  <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e1e1e1", padding: "16px", minHeight: "400px" }}>
                    <div style={{ textAlign: "center", marginBottom: "16px", padding: "0 10px" }}>
                      <p style={{ fontSize: "14px", color: "#666", margin: 0, fontWeight: 500 }}>
                        <i className="fas fa-lock" style={{ marginRight: "6px", color: "#2EAA46" }}></i>
                        {t('securePaymentInfo') || "Tüm işlemler güvenli ve şifrelidir."}
                      </p>
                    </div>
                    <IyzicoCheckoutModal checkoutFormContent={checkoutFormContent} />
                  </div>
                </div>
              )}
            </div>
            
            <div className="col-lg-6">
              <div style={{ position: "sticky", top: "100px" }}>
                <OrderArea
                  showIyzicoModal={showIyzicoModal}
                  {...others}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CheckoutArea;

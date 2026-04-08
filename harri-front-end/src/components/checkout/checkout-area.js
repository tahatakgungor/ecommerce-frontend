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
  const { t, lang } = useLanguage();
  const { paymentMethod, setPaymentMethod } = others;
  const paymentRef = React.useRef(null);

  React.useEffect(() => {
    if (showIyzicoModal && paymentRef.current) {
      paymentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showIyzicoModal]);

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
                <div 
                  ref={paymentRef}
                  className="iyzico-inline-container mb-4"
                  style={{ scrollMarginTop: "120px" }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h3 className="m-0" style={{ fontSize: "20px" }}>
                      {lang === 'tr' ? "Ödeme Adımı Bekleniyor" : t('payment')}
                    </h3>
                    <button 
                      type="button" 
                      onClick={closeIyzicoModal}
                      className="tp-btn-border btn-sm"
                      style={{ padding: "4px 16px", fontSize: "13px" }}
                    >
                      <i className="fal fa-arrow-left me-2"></i>
                      {t('back') === 'back' ? "Geri Dön" : t('back')}
                    </button>
                  </div>
                  
                  <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e1e1e1", padding: "0", minHeight: checkoutFormContent ? "600px" : "0", overflow: "hidden" }}>
                    <IyzicoCheckoutModal key={checkoutFormContent?.length || 0} checkoutFormContent={checkoutFormContent} />
                  </div>
                </div>
              )}
            </div>
            
            <div className="col-lg-6">
              <div 
                className="checkout-order-summary-wrapper"
                style={{ 
                  position: "sticky", 
                  top: "100px",
                  zIndex: 5
                }}
              >
                <OrderArea
                  showIyzicoModal={showIyzicoModal}
                  {...others}
                />
              </div>
              <style jsx>{`
                @media (max-width: 991px) {
                  .checkout-order-summary-wrapper {
                    position: static !important;
                  }
                }
              `}</style>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CheckoutArea;

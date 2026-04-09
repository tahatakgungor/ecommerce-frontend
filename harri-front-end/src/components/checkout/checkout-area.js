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
  const [isMobileViewport, setIsMobileViewport] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobileViewport(window.matchMedia("(max-width: 991px)").matches);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useLayoutEffect(() => {
    if (!showIyzicoModal) return;
    if (isMobileViewport) {
      document.body.style.overflow = "hidden";
      window.scrollTo({ top: 0, behavior: "auto" });
      const t = window.setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 60);
      return () => {
        window.clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
    return undefined;
  }, [showIyzicoModal, isMobileViewport]);

  React.useEffect(() => {
    if (showIyzicoModal && paymentRef.current) {
      paymentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showIyzicoModal]);

  React.useEffect(() => {
    if (!showIyzicoModal || !isMobileViewport) {
      return;
    }
    const onMessage = (event) => {
      if (event?.data?.type === "iyzico_focus") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [showIyzicoModal, isMobileViewport]);

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
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-30 pb-10 border-bottom">
          <Link href="/cart" className="tp-checkout-back-link d-flex align-items-center" style={{ color: "#0989ff", fontSize: "14px", fontWeight: "500" }}>
            <i className="fal fa-arrow-left me-2"></i> {t("viewCart")}
          </Link>
          <button 
            type="button" 
            onClick={handleClearCart} 
            className="tp-checkout-clear-link"
            style={{ 
              background: "none", 
              border: "none", 
              color: "#888", 
              fontSize: "13px", 
              textDecoration: "underline",
              padding: 0
            }}
          >
            {t("clearCart")}
          </button>
        </div>
        <form onSubmit={handleSubmit(submitHandler)}>
          <div className="row">
            <div className="col-lg-6">
              {!showIyzicoModal ? (
                <div className="checkbox-form">
                  <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "25px", pb: "10px", borderBottom: "2px solid #f0f0f0" }}>
                    {t('billingDetails')}
                  </h3>
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
      {showIyzicoModal && isMobileViewport && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 1050, background: "#ffffff", overflowY: "auto" }}
        >
          <div className="container py-3">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="m-0" style={{ fontSize: "18px", fontWeight: 700 }}>
                {lang === "tr" ? "3D Güvenli Ödeme" : "3D Secure Payment"}
              </h3>
              <button
                type="button"
                onClick={closeIyzicoModal}
                className="tp-btn-border btn-sm"
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                {lang === "tr" ? "Kapat" : "Close"}
              </button>
            </div>
            <p className="mb-3 text-muted" style={{ fontSize: "12px" }}>
              {lang === "tr"
                ? "Banka doğrulama ekranı aşağıda açıldı. Şifrenizi girip işlemi tamamladıktan sonra otomatik olarak sonuç sayfasına yönlendirileceksiniz."
                : "Bank verification screen is open below. After entering your password, you will be redirected to the result page automatically."}
            </p>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
              <IyzicoCheckoutModal key={checkoutFormContent?.length || 0} checkoutFormContent={checkoutFormContent} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CheckoutArea;

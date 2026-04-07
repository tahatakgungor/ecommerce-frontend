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
                  
                  <div className="payment-method-selection mt-40">
                    <h3 className="mb-20" style={{ fontSize: '22px' }}>{t('paymentMethod') || "Ödeme Seçenekleri"}</h3>
                    
                    <div className="payment-methods-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Banka / Kredi Kartı */}
                      <label 
                        className={`payment-item ${paymentMethod === 'card' ? 'active' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '16px',
                          border: `2px solid ${paymentMethod === 'card' ? '#2EAA46' : '#e1e1e1'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          style={{ marginRight: '12px', width: '18px', height: '18px' }}
                        />
                        <div className="flex-grow-1">
                          <span style={{ fontWeight: '600', fontSize: '15px' }}>{t('creditCard') || "Banka / Kredi Kartı ile Öde"}</span>
                        </div>
                        <div className="payment-icons" style={{ display: 'flex', gap: '10px', fontSize: '20px', color: '#777' }}>
                          <i className="fab fa-cc-visa"></i>
                          <i className="fab fa-cc-mastercard"></i>
                        </div>
                      </label>

                      {/* Iyzico Pay */}
                      <label 
                        className={`payment-item ${paymentMethod === 'iyzico' ? 'active' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '16px',
                          border: `2px solid ${paymentMethod === 'iyzico' ? '#2EAA46' : '#e1e1e1'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="iyzico"
                          checked={paymentMethod === 'iyzico'}
                          onChange={() => setPaymentMethod('iyzico')}
                          style={{ marginRight: '12px', width: '18px', height: '18px' }}
                        />
                        <div className="flex-grow-1">
                          <span style={{ fontWeight: '600', fontSize: '15px' }}>{t('payWithIyzico') || "iyzico ile Öde"}</span>
                        </div>
                        <i className="fal fa-wallet" style={{ fontSize: '20px', color: '#777' }}></i>
                      </label>
                    </div>

                    <div className="mt-20 p-3" style={{ background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
                      <p style={{ fontSize: '13px', color: '#666', margin: 0, lineHeight: '1.5' }}>
                        <i className="fas fa-shield-alt me-2" style={{ color: '#2EAA46' }}></i>
                        {lang === 'tr' 
                          ? "Ödemeleriniz iyzico güvencesiyle 256-bit SSL sertifikası ile şifrelenir."
                          : "Your payments are encrypted with 256-bit SSL certificate under iyzico assurance."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="iyzico-inline-container mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h3 className="m-0" style={{ fontSize: "20px" }}>
                      {t('payment') === 'payment' ? "Ödeme" : t('payment')}
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
                  
                  <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e1e1e1", padding: "0", minHeight: "600px", overflow: "hidden" }}>
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

'use client';
import React, { useState } from "react";
import { useSelector } from "react-redux";
// internal
import CouponForm from "@components/forms/coupon-form";
import LoginForm from "@components/forms/login-form";
import { useLanguage } from "src/context/LanguageContext";

const CouponArea = (props) => {
  const [checkoutLogin, setCheckoutLogin] = useState(false);
  const [checkoutCoupon, setCheckoutCoupon] = useState(false);
  const { t } = useLanguage();
  const { user } = useSelector((state) => state.auth);

  return (
    <section className="coupon-area pt-100 pb-20">
      <div className="container">
        <div className="row">
          {!user && (
            <div className="col-md-6 mb-20">
              <div 
                className="tp-checkout-alert-banner d-flex align-items-center"
                style={{
                  background: "#f0f7ff",
                  border: "1px solid #d0e5ff",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => setCheckoutLogin(!checkoutLogin)}
              >
                <div className="icon me-3" style={{ fontSize: "24px", color: "#0989ff" }}>
                  <i className="fas fa-user-circle"></i>
                </div>
                <div className="content">
                  <h5 className="m-0" style={{ fontSize: "15px", fontWeight: "600", color: "#333" }}>
                    {t('returningCustomer')}? {" "}
                    <span style={{ color: "#0989ff", textDecoration: "underline" }}>
                      {t('clickToLogin')}
                    </span>
                  </h5>
                </div>
              </div>
              {checkoutLogin && (
                <div className="coupon-content mt-15 p-20" style={{ background: "#fff", border: "1px solid #e1e1e1", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                  <LoginForm />
                </div>
              )}
            </div>
          )}
          <div className={`${!user ? 'col-md-6' : 'col-12'} mb-20`}>
            <div 
              className="tp-checkout-alert-banner d-flex align-items-center"
              style={{
                background: "#f3f0ff",
                border: "1px solid #e5dbff",
                borderRadius: "12px",
                padding: "16px 20px",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onClick={() => setCheckoutCoupon(!checkoutCoupon)}
            >
              <div className="icon me-3" style={{ fontSize: "24px", color: "#7e53f9" }}>
                <i className="fas fa-ticket-alt"></i>
              </div>
              <div className="content">
                <h5 className="m-0" style={{ fontSize: "15px", fontWeight: "600", color: "#333" }}>
                  {t('haveCoupon')}? {" "}
                  <span style={{ color: "#7e53f9", textDecoration: "underline" }}>
                    {t('clickToEnterCode')}
                  </span>
                </h5>
              </div>
            </div>
            {checkoutCoupon && (
              <div className="coupon-checkout-content mt-15 p-20" style={{ background: "#fff", border: "1px solid #e1e1e1", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                <CouponForm {...props} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CouponArea;

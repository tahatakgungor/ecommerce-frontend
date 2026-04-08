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
    <section className="coupon-area pt-60 pb-10">
      <div className="container">
        <div className="row">
          {!user && (
            <div className="col-md-6 mb-15">
              <div 
                className="tp-checkout-alert-simplified d-flex align-items-center"
                style={{
                  background: "#f9f9f9",
                  border: "1px solid #ebebeb",
                  borderRadius: "8px",
                  padding: "12px 18px",
                  cursor: "pointer"
                }}
                onClick={() => setCheckoutLogin(!checkoutLogin)}
              >
                <div className="icon me-3" style={{ fontSize: "18px", color: "#666" }}>
                  <i className="fal fa-user"></i>
                </div>
                <div className="content">
                  <span style={{ fontSize: "14px", color: "#555" }}>
                    {t('returningCustomer')} {" "}
                    <span style={{ color: "#0989ff", fontWeight: "600", textDecoration: "none" }}>
                      {t('clickToLogin')}
                    </span>
                  </span>
                </div>
              </div>
              {checkoutLogin && (
                <div className="coupon-content mt-10 p-20" style={{ background: "#fff", border: "1px solid #eee", borderRadius: "8px" }}>
                  <LoginForm />
                </div>
              )}
            </div>
          )}
          <div className={`${!user ? 'col-md-6' : 'col-12'} mb-15`}>
            <div 
              className="tp-checkout-alert-simplified d-flex align-items-center"
              style={{
                background: "#f9f9f9",
                border: "1px solid #ebebeb",
                borderRadius: "8px",
                padding: "12px 18px",
                cursor: "pointer"
              }}
              onClick={() => setCheckoutCoupon(!checkoutCoupon)}
            >
              <div className="icon me-3" style={{ fontSize: "18px", color: "#666" }}>
                <i className="fal fa-tags"></i>
              </div>
              <div className="content">
                <span style={{ fontSize: "14px", color: "#555" }}>
                  {t('haveCoupon')} {" "}
                  <span style={{ color: "#0989ff", fontWeight: "600", textDecoration: "none" }}>
                    {t('clickToEnterCode')}
                  </span>
                </span>
              </div>
            </div>
            {checkoutCoupon && (
              <div className="coupon-checkout-content mt-10 p-20" style={{ background: "#fff", border: "1px solid #eee", borderRadius: "8px" }}>
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

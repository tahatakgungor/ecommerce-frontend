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
    <section className="coupon-area pt-120 pb-30">
      <div className="container">
        <div className="row">
          {!user && (
          <div className="col-md-6">
            <div className="coupon-accordion">
              <h3>
                {t('returningCustomer')}{" "}
                <span
                  onClick={() => setCheckoutLogin(!checkoutLogin)}
                  id="showlogin"
                >
                  {t('clickToLogin')}
                </span>
              </h3>
              {checkoutLogin && (
                <div id="checkout-login" className="coupon-content">
                  <div className="coupon-info">
                    <LoginForm />
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
          <div className="col-md-6">
            <div className="coupon-accordion">
              <h3>
                {t('haveCoupon')}{" "}
                <span
                  onClick={() => setCheckoutCoupon(!checkoutCoupon)}
                  id="showcoupon"
                >
                  {t('clickToEnterCode')}
                </span>
              </h3>
              {checkoutCoupon && (
                <div id="checkout_coupon" className="coupon-checkout-content">
                  <div className="coupon-info">
                    <CouponForm {...props} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CouponArea;

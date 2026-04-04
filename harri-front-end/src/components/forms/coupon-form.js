import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { useLanguage } from "src/context/LanguageContext";

const CouponForm = ({handleCouponCode,couponRef}) => {
  const { coupon_info } = useSelector((state) => state.coupon);
  const { t } = useLanguage();
  return (
    <form onSubmit={handleCouponCode}>
      {coupon_info?.couponCode ? (
        <p>{t('couponApplied')}</p>
      ) : (
        <p className="checkout-coupon">
          <input ref={couponRef} type="text" placeholder={t('couponCodePlaceholder')} />
          <button className="tp-btn" type="submit">
            {t('applyCoupon')}
          </button>
        </p>
      )}
    </form>
  );
};

export default CouponForm;

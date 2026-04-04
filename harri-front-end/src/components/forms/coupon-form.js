import React from "react";
import { useSelector } from "react-redux";
import { useLanguage } from "src/context/LanguageContext";

const CouponForm = ({handleCouponCode,couponRef,handleRemoveCoupon}) => {
  const { coupon_info } = useSelector((state) => state.coupon);
  const { t } = useLanguage();
  return (
    <form onSubmit={handleCouponCode}>
      {coupon_info?.couponCode ? (
        <div className="d-flex flex-column gap-2">
          <p className="mb-0">
            {t('appliedCouponLabel')}: <strong>{coupon_info.title} ({coupon_info.couponCode})</strong>
          </p>
          <p className="mb-0 text-muted">{t('couponReservedUntilOrder')}</p>
          <button className="tp-btn tp-btn-border" type="button" onClick={handleRemoveCoupon}>
            {t('removeCoupon')}
          </button>
        </div>
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

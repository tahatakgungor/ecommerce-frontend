import React from "react";
import { useSelector } from "react-redux";
import { useLanguage } from "src/context/LanguageContext";

const CouponForm = ({handleCouponCode,couponRef,handleRemoveCoupon}) => {
  const { coupon_info } = useSelector((state) => state.coupon);
  const { t } = useLanguage();
  return (
    <form onSubmit={handleCouponCode}>
      {coupon_info?.couponCode ? (
        <div
          className="d-flex flex-column gap-2"
          style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 14px", background: "#f8fafc" }}
        >
          <p className="mb-0" style={{ fontSize: 14 }}>
            {t('appliedCouponLabel')}: <strong>{coupon_info.title} ({coupon_info.couponCode})</strong>
          </p>
          <p className="mb-0 text-muted" style={{ fontSize: 12 }}>{t('couponReservedUntilOrder')}</p>
          <button
            className="tp-btn-border"
            style={{
              minHeight: 36,
              borderRadius: 999,
              borderColor: "#d1d5db",
              background: "#fff",
              color: "#374151",
              fontWeight: 600,
              padding: "0 14px",
              width: "fit-content",
            }}
            type="button"
            onClick={handleRemoveCoupon}
          >
            {t('removeCoupon')}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            ref={couponRef}
            type="text"
            placeholder={t('couponCodePlaceholder')}
            style={{
              flex: "1 1 240px",
              minHeight: 42,
              borderRadius: 10,
              border: "1px solid #d1d5db",
              padding: "0 12px",
            }}
          />
          <button
            className="tp-btn"
            style={{ minHeight: 42, borderRadius: 999, padding: "0 20px", fontWeight: 700 }}
            type="submit"
          >
            {t('applyCoupon')}
          </button>
        </div>
      )}
    </form>
  );
};

export default CouponForm;

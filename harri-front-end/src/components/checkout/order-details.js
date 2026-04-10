'use client';
import React from "react";
// internal
import useCartInfo from "@hooks/use-cart-info";
import ErrorMessage from "@components/error-message/error";
import { useLanguage } from "src/context/LanguageContext";

const OrderDetails = ({
  register,
  errors,
  handleShippingCost,
  cartTotal,
  shippingCost,
  freeShippingThreshold,
  discountAmount,
  appliedCoupon,
  handleRemoveCoupon,
}) => {
  const { total } = useCartInfo();
  const { t, lang } = useLanguage();
  const shippingOptionRequired = t('shippingOptionRequired');
  const subtotalAmount = Number(total || 0);
  const finalTotalAmount = Number(cartTotal || 0);
  const discountSafe = Number(discountAmount || 0);
  const shippingSafe = Number(shippingCost || 0);
  const thresholdSafe = Number(freeShippingThreshold || 0);
  const isFreeShipping = shippingSafe <= 0;

  return (
    <React.Fragment>
      <tr className="cart-subtotal">
        <th>{t('cartSubtotal')}</th>
        <td className="text-end">
          <span className="amount text-end">₺{subtotalAmount.toFixed(2)}</span>
        </td>
      </tr>
      {/* SHIPPING LINE */}
      <tr className="shipping">
        <th>{t('shipping')}</th>
        <td className="text-end">
          <div className="d-flex flex-column align-items-end gap-1">
            <label
              style={{ fontWeight: "700", color: isFreeShipping ? "#2EAA46" : "#374151", margin: 0 }}
            >
              {isFreeShipping
                ? (lang === 'tr' ? "Ücretsiz" : (t('freeShipping') || "Free"))
                : `₺${shippingSafe.toFixed(2)}`}
            </label>
            {thresholdSafe > 0 && (
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                {isFreeShipping
                  ? (lang === "tr"
                      ? `₺${thresholdSafe.toFixed(2)} üzeri ücretsiz kargo`
                      : `Free shipping over ₺${thresholdSafe.toFixed(2)}`)
                  : (lang === "tr"
                      ? `₺${thresholdSafe.toFixed(2)} üstü siparişte ücretsiz olur`
                      : `Free over ₺${thresholdSafe.toFixed(2)}`)}
              </span>
            )}
          </div>
          <input
            {...register(`shippingOption`, {
              required: shippingOptionRequired,
            })}
            id="free_shipping"
            type="hidden"
            name="shippingOption"
            value={isFreeShipping ? "Ücretsiz Gönderim" : "Standart Kargo"}
          />
        </td>
      </tr>

      {appliedCoupon?.couponCode && (
        <tr className="shipping">
          <th>{t('couponCode')}</th>
          <td className="text-end">
            <div className="d-flex flex-column align-items-end gap-1">
              <strong className="text-end">
                <span className="amount d-inline-block">
                  {appliedCoupon.title || t('couponCode')} ({appliedCoupon.couponCode})
                </span>
              </strong>
              <span className="text-muted" style={{ fontSize: 12 }}>
                %{Number(appliedCoupon.discountPercentage || 0)} {lang === "tr" ? "indirim" : "discount"}
              </span>
              <button
                className="tp-btn-border btn-sm"
                style={{
                  minHeight: 34,
                  padding: "0 14px",
                  borderRadius: 999,
                  borderColor: "#e5e7eb",
                  color: "#374151",
                  background: "#f9fafb",
                  fontWeight: 600,
                }}
                type="button"
                onClick={handleRemoveCoupon}
              >
                {t('removeCoupon')}
              </button>
            </div>
          </td>
        </tr>
      )}

      {discountSafe > 0 && (
        <tr className="shipping">
          <th>{t('discount')}</th>
          <td className="text-end">
            <strong><span className="amount">-₺{discountSafe.toFixed(2)}</span></strong>
          </td>
        </tr>
      )}

      <tr className="order-total">
        <th>{t('totalOrder')}</th>
        <td className="text-end">
          <strong><span className="amount">₺{finalTotalAmount.toFixed(2)}</span></strong>
        </td>
      </tr>
    </React.Fragment>
  );
};

export default OrderDetails;

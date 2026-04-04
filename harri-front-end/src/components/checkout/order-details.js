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
  discountAmount,
  appliedCoupon,
  handleRemoveCoupon,
}) => {
  const { total } = useCartInfo();
  const { t } = useLanguage();
  const shippingOptionRequired = t('shippingOptionRequired');

  return (
    <React.Fragment>
      <tr className="cart-subtotal">
        <th>{t('cartSubtotal')}</th>
        <td className="text-end">
          <span className="amount text-end">₺{total}</span>
        </td>
      </tr>
      <tr className="shipping">
        <th>{t('shipping')}</th>
        <td className="text-end">
          <ul>
            <li>
              <input
                {...register(`shippingOption`, {
                  required: shippingOptionRequired,
                })}
                id="flat_shipping"
                type="radio"
                name="shippingOption"
              />
              <label
                onClick={() => handleShippingCost(60)}
                htmlFor="flat_shipping"
              >
                <span className="amount">{t('deliveryToday')}</span>
              </label>
              <ErrorMessage message={errors?.shippingOption?.message} />
            </li>
            <li>
              <input
                {...register(`shippingOption`, {
                  required: shippingOptionRequired,
                })}
                id="free_shipping"
                type="radio"
                name="shippingOption"
              />
              <label
                onClick={() => handleShippingCost(20)}
                htmlFor="free_shipping"
              >
                {t('delivery7Days')}
              </label>
              <ErrorMessage message={errors?.shippingOption?.message} />
            </li>
          </ul>
        </td>
      </tr>

      <tr className="shipping">
        <th>{t('subTotal')}</th>
        <td className="text-end">
          <strong><span className="amount">₺{total}</span></strong>
        </td>
      </tr>

      <tr className="shipping">
        <th>{t('shippingCost')}</th>
        <td className="text-end">
          <strong><span className="amount">₺{shippingCost}</span></strong>
        </td>
      </tr>

      {appliedCoupon?.couponCode && (
        <tr className="shipping">
          <th>{t('couponCode')}</th>
          <td className="text-end">
            <div className="d-flex flex-column align-items-end gap-1">
              <strong>
                <span className="amount">
                  {appliedCoupon.title} ({appliedCoupon.couponCode})
                </span>
              </strong>
              <button
                className="tp-btn tp-btn-border btn-sm"
                type="button"
                onClick={handleRemoveCoupon}
              >
                {t('removeCoupon')}
              </button>
            </div>
          </td>
        </tr>
      )}

      {discountAmount > 0 && (
        <tr className="shipping">
          <th>{t('discount')}</th>
          <td className="text-end">
            <strong><span className="amount">₺{discountAmount.toFixed(2)}</span></strong>
          </td>
        </tr>
      )}

      <tr className="order-total">
        <th>{t('totalOrder')}</th>
        <td className="text-end">
          <strong><span className="amount">₺{cartTotal}</span></strong>
        </td>
      </tr>
    </React.Fragment>
  );
};

export default OrderDetails;

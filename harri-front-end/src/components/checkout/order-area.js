'use client';
import React from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
// internal
import OrderDetails from "./order-details";
import OrderSingleCartItem from "./order-single-cart-item";
import { useLanguage } from "src/context/LanguageContext";

const OrderArea = ({
  register,
  errors,
  discountAmount,
  shippingCost,
  cartTotal,
  handleShippingCost,
  isCheckoutSubmit,
  appliedCoupon,
  handleRemoveCoupon,
  showIyzicoModal,
}) => {
  const { cart_products } = useSelector((state) => state.cart);
  const { t, lang } = useLanguage();

  return (
    <div className="your-order mb-30 ">
      <h3>{t('yourOrder')}</h3>
      <div className="your-order-table table-responsive">
        <table>
          <thead>
            <tr>
              <th className="product-name">{t('product')}</th>
              <th className="product-total text-end">{t('total')}</th>
            </tr>
          </thead>
          <tbody>
            {cart_products?.map((item, i) => {
              const netPrice =
                Number.isFinite(Number(item.price))
                  ? Number(item.price)
                  : (item.discount && item.discount > 0
                      ? item.originalPrice - (item.originalPrice * item.discount) / 100
                      : item.originalPrice);
              return (
                <OrderSingleCartItem
                  key={i}
                  productId={item._id}
                  title={item.title}
                  image={item.image}
                  quantity={item.orderQuantity}
                  price={(netPrice * item.orderQuantity).toFixed(2)}
                />
              );
            })}
          </tbody>
          <tfoot>
            <OrderDetails
              register={register}
              errors={errors}
              discountAmount={discountAmount}
              cartTotal={cartTotal}
              shippingCost={shippingCost}
              handleShippingCost={handleShippingCost}
              appliedCoupon={appliedCoupon}
              handleRemoveCoupon={handleRemoveCoupon}
            />
          </tfoot>
        </table>
      </div>

      {!showIyzicoModal && (
        <div className="order-button-payment mt-25">
          <button
            type="submit"
            className="tp-btn"
            disabled={cart_products.length === 0 || isCheckoutSubmit}
          >
            {isCheckoutSubmit ? (t('processing') || "İşleniyor...") : (lang === "tr" ? "Ödeme Adımına Geç" : "Proceed to Payment")}
          </button>
        </div>
      )}

      {isCheckoutSubmit && typeof window !== "undefined" && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'wait', pointerEvents: 'all' }}>
          <div style={{ width: 54, height: 54, border: '5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'checkoutSpin 0.75s linear infinite' }} />
          <style>{'@keyframes checkoutSpin{to{transform:rotate(360deg)}}'}</style>
        </div>,
        document.body
      )}
    </div>
  );
};

export default OrderArea;

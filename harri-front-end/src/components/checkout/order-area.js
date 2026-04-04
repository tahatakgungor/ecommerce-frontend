'use client';
import React from "react";
import { useSelector } from "react-redux";
// internal
import OrderDetails from "./order-details";
import PaymentCardElement from "@components/order/pay-card-element";
import OrderSingleCartItem from "./order-single-cart-item";
import { useLanguage } from "src/context/LanguageContext";

const OrderArea = ({
  stripe,
  error,
  register,
  errors,
  discountAmount,
  shippingCost,
  cartTotal,
  handleShippingCost,
  isCheckoutSubmit,
  appliedCoupon,
  handleRemoveCoupon,
}) => {
  const { cart_products } = useSelector((state) => state.cart);
  const { t } = useLanguage();

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
              const netPrice = item.discount && item.discount > 0
                ? item.originalPrice - (item.originalPrice * item.discount) / 100
                : item.originalPrice;
              return (
                <OrderSingleCartItem
                  key={i}
                  productId={item._id}
                  title={item.title}
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

      <div className="payment-method faq__wrapper tp-accordion">
        <div className="accordion" id="checkoutAccordion">
          <div className="accordion-item">
            <h2 className="accordion-header" id="checkoutOne">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#bankOne"
                aria-expanded="true"
                aria-controls="bankOne"
              >
                {t('directBankTransfer')}
                <span className="accordion-btn"></span>
              </button>
            </h2>
            <div
              id="bankOne"
              className="accordion-collapse collapse show"
              aria-labelledby="checkoutOne"
              data-bs-parent="#checkoutAccordion"
            >
              <div className="accordion-body">
                <PaymentCardElement
                  stripe={stripe}
                  cardError={error}
                  cart_products={cart_products}
                  isCheckoutSubmit={isCheckoutSubmit}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderArea;

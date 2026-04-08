import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
// internal
import SingleCartItem from "./single-cart-item";
import useCartInfo from "@hooks/use-cart-info";
import EmptyCart from "./empty-cart";
import { useLanguage } from "src/context/LanguageContext";
import { clear_cart } from "src/redux/features/cartSlice";
import { clear_coupon } from "src/redux/features/coupon/couponSlice";
import { notifySuccess } from "@utils/toast";

const CartSidebar = ({ isCartOpen, setIsCartOpen }) => {
  const dispatch = useDispatch();
  const { cart_products } = useSelector((state) => state.cart);
  const { total } = useCartInfo();
  const { t } = useLanguage();

  const handleClearCart = () => {
    const confirmed = window.confirm(t("clearCartConfirm"));
    if (!confirmed) return;
    dispatch(clear_cart());
    dispatch(clear_coupon());
    notifySuccess(t("clearCartSuccess"));
    setIsCartOpen(false);
  };

  return (
    <React.Fragment>
      <div className={`cartmini__area ${isCartOpen ? "cartmini-opened" : ""}`}>
        <div className="cartmini__wrapper d-flex justify-content-between flex-column">
          <div className="cartmini__top-wrapper ">
            <div className="cartmini__top p-relative">
              <div className="cartmini__title">
                <h4>{t('shoppingCart')}</h4>
              </div>
              <div className="cartmini__close">
                <button
                  onClick={() => setIsCartOpen(false)}
                  type="button"
                  className="cartmini__close-btn cartmini-close-btn"
                  aria-label="Sepeti kapat"
                >
                  <i className="fal fa-times"></i>
                </button>
              </div>
            </div>
            {cart_products.length > 0 && (
              <div className="cartmini__widget">
                {cart_products.map((item, i) => (
                  <SingleCartItem key={i} item={item} setIsCartOpen={setIsCartOpen} />
                ))}
              </div>
            )}
            {cart_products.length === 0 && <EmptyCart />}
          </div>
          <div className="cartmini__checkout">
            <div className="cartmini__checkout-title mb-30">
              <h4>{t('subtotalColon')}</h4>
              <span>₺{total.toFixed(2)}</span>
            </div>
            <div className="cartmini__checkout-btn">
              {cart_products.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="tp-btn-border mb-10 w-100"
                >
                  <span></span> {t("clearCart")}
                </button>
              )}
              <Link href="/cart" onClick={() => setIsCartOpen(false)} className="tp-btn mb-10 w-100">
                <span></span> {t('viewCart')}
              </Link>
              <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="tp-btn-border w-100 cursor-pointer">
                <span></span> {t('checkout')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* overlay */}
      <div
        onClick={() => setIsCartOpen(false)}
        className={`body-overlay ${isCartOpen ? "opened" : ""}`}
      ></div>
    </React.Fragment>
  );
};

export default CartSidebar;

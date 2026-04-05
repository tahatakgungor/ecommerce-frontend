'use client';
import React from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
// internal
import CartTotal from "./cart-total";
import SingleCartItem from "./single-cart";
import CartRelatedProducts from "./cart-related-products";
import EmptyCart from "@components/common/sidebar/cart-sidebar/empty-cart";
import { useLanguage } from "src/context/LanguageContext";
import { clear_cart } from "src/redux/features/cartSlice";
import { clear_coupon } from "src/redux/features/coupon/couponSlice";
import { notifySuccess } from "@utils/toast";

const CartArea = () => {
  const dispatch = useDispatch();
  const { cart_products } = useSelector((state) => state.cart);
  const { t } = useLanguage();
  
  const handleClearCart = () => {
    const confirmed = window.confirm(t("clearCartConfirm"));
    if (!confirmed) return;
    dispatch(clear_cart());
    dispatch(clear_coupon());
    notifySuccess(t("clearCartSuccess"));
  };

  return (
    <section className="cart-area pt-100 pb-100">
      <div className="container">
        <div className="row">
          <div className="col-12">
            {cart_products.length > 0 && (
              <form onSubmit={e => e.preventDefault()}>
                <div className="mb-3">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <Link href="/shop" style={{ color: "#555", fontSize: "14px" }}>
                      <i className="fal fa-reply me-1"></i> {t('continueShopping')}
                    </Link>
                    <button
                      type="button"
                      onClick={handleClearCart}
                      className="tp-btn-border"
                    >
                      {t("clearCart")}
                    </button>
                  </div>
                </div>

                <div className="tp-cart-items mb-4">
                  {cart_products.map((item, i) => (
                    <SingleCartItem key={i} item={item} />
                  ))}
                </div>

                <div className="row justify-content-end">
                  <div className="col-md-5">
                    <CartTotal />
                  </div>
                </div>
              </form>
            )}
            {cart_products.length === 0 && <EmptyCart />}
          </div>
        </div>
      </div>
      {cart_products.length > 0 && <CartRelatedProducts />}
    </section>
  );
};

export default CartArea;

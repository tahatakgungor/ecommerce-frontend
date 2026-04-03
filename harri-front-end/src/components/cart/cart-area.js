'use client';
import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
// internal
import CartTotal from "./cart-total";
import SingleCartItem from "./single-cart";
import EmptyCart from "@components/common/sidebar/cart-sidebar/empty-cart";
import { useLanguage } from "src/context/LanguageContext";

const CartArea = () => {
  const { cart_products } = useSelector((state) => state.cart);
  const { t } = useLanguage();

  return (
    <section className="cart-area pt-100 pb-100">
      <div className="container">
        <div className="row">
          <div className="col-12">
            {cart_products.length > 0 && (
              <form onSubmit={e => e.preventDefault()}>
                <div className="mb-3">
                  <Link href="/shop" style={{ color: "#555", fontSize: "14px" }}>
                    <i className="fal fa-reply me-1"></i> {t('continueShopping')}
                  </Link>
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
    </section>
  );
};

export default CartArea;

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
                <div className="table-content table-responsive">
                  <div className="tp-continue-shopping">
                    <p>
                      <Link href="/shop">
                        {t('continueShopping')} <i className="fal fa-reply"></i>
                      </Link>
                    </p>
                  </div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="product-thumbnail">{t('images')}</th>
                        <th className="cart-product-name">{t('product')}</th>
                        <th className="product-price">{t('unitPrice')}</th>
                        <th className="product-quantity">{t('quantity')}</th>
                        <th className="product-subtotal">{t('total')}</th>
                        <th className="product-remove">{t('remove')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart_products.map((item, i) => (
                        <SingleCartItem key={i} item={item} />
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="row justify-content-end">
                  <div className="col-md-5 mr-auto">
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

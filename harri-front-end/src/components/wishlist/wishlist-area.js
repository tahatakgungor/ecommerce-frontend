'use client';
import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
// internal
import EmptyCart from "@components/common/sidebar/cart-sidebar/empty-cart";
import SingleWishlist from "./single-wishlist";
import { useLanguage } from "src/context/LanguageContext";

const WishlistArea = () => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { t } = useLanguage();
  return (
    <section className="cart-area pt-100 pb-100">
      <div className="container">
        <div className="row">
          <div className="col-12">
            {wishlist.length > 0 && (
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
                      {wishlist.map((item, i) => (
                        <SingleWishlist key={i} item={item} />
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="tp-wishlist-btn mt-50">
                      <Link href="/cart" className="tp-btn tp-btn-black">
                        {t('goToCart')}
                      </Link>
                    </div>
                  </div>
                </div>
              </form>
            )}
            {wishlist.length === 0 && <EmptyCart />}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WishlistArea;

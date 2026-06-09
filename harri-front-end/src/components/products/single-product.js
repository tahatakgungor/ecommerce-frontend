'use client';
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
// internal
import { CartTwo, HeartTwo } from "@svg/index";
import OldNewPrice from "./old-new-price";
import ProductRatingSummary from "./product-rating-summary";
import {
  initialOrderQuantity,
} from "src/redux/features/cartSlice";
import { add_to_wishlist } from "src/redux/features/wishlist-slice";
import { setProduct } from "src/redux/features/productSlice";
import { useLanguage } from "src/context/LanguageContext";
import {
  PRODUCT_IMAGE_FALLBACK,
  buildImageErrorFallbackHandler,
  isExternalMediaUrl,
} from "src/utils/media-url";
import { formatCountBadge, getProductQtyInCart } from "src/utils/cart-ui";

const SingleProduct = ({ product, discountPrd = false }) => {
  const { _id, image, title, price, discount = 0, originalPrice } = product || {};
  const productImage = image || PRODUCT_IMAGE_FALLBACK;
  const dispatch = useDispatch();
  const { cart_products } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const isWishlistAdded = wishlist.some(item => item._id === _id);
  const cartQty = getProductQtyInCart(cart_products, _id);
  const isAddedToCart = cartQty > 0;
  const { t, lang } = useLanguage();
  const rawStockQuantity = Number(product?.quantity);
  const stockQuantity = Number.isFinite(rawStockQuantity)
    ? rawStockQuantity
    : String(product?.status || "").toLowerCase() === "active"
      ? 99
      : 0;
  const stockChip =
    stockQuantity > 10
      ? {
          label: lang === "tr" ? "Stokta" : "In stock",
          className: "product-stock-chip product-stock-chip--ready",
        }
      : stockQuantity > 0
        ? {
            label: lang === "tr" ? "Son adetler" : "Low stock",
            className: "product-stock-chip product-stock-chip--low",
          }
        : {
            label: lang === "tr" ? "Teyit bekliyor" : "Awaiting stock",
            className: "product-stock-chip product-stock-chip--backorder",
          };

  // handle add wishlist
  const handleAddWishlist = (prd) => {
    dispatch(add_to_wishlist(prd));
  };

  // handle quick view
  const handleQuickView = (prd) => {
    dispatch(initialOrderQuantity())
    dispatch(setProduct(prd))
  };

  return (
    <React.Fragment>
      <div className="product__item p-relative transition-3 mb-50">
        <div className="product__thumb product__thumb--fixed w-img p-relative fix">
          <Link href={`/product-details/${_id}`}>
            <Image
              className="product__thumb-media"
              src={productImage}
              alt="product image"
              width={960}
              height={1125}
              unoptimized={isExternalMediaUrl(productImage)}
              onError={buildImageErrorFallbackHandler(PRODUCT_IMAGE_FALLBACK)}
              sizes="(max-width: 576px) 50vw, (max-width: 992px) 33vw, 25vw"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Link>

          {discount > 0 && (
            <div className="product__badge d-flex flex-column flex-wrap">
              <span
                className={`product__badge-item ${
                  discountPrd ? "has-offer" : "has-new"
                }`}
              >
                {discountPrd ? `-${discount}%` : "sale"}
              </span>
              {!discountPrd && (
                <span className={`product__badge-item has-offer`}>
                  {`-${discount}%`}
                </span>
              )}
            </div>
          )}

        </div>

        <div className="product__content">
          <h3 className="product__title">
            <Link href={`/product-details/${_id}`}>{title}</Link>
          </h3>
          <ProductRatingSummary
            productId={_id}
            compact
            className="tp-rating-summary--card mb-6"
            linkCountToReviews
          />
          {discount <= 0 && (
            <div className="product__price">
              <span className="product__ammount">
                ₺{originalPrice.toFixed(2)}
              </span>
            </div>
          )}
          {discount > 0 && (
            <OldNewPrice originalPrice={originalPrice} discount={discount} price={price} />
          )}

          <div className="product__card-bottom">
            <div className={stockChip.className}>{stockChip.label}</div>
            <div className="product__card-actions">
              <button
                onClick={() => handleQuickView(product)}
                type="button"
                className={`product-add-cart-btn product-add-cart-btn--card product-add-cart-btn--mobile${isAddedToCart ? " is-added" : ""}`}
                aria-label={isAddedToCart ? `${t('addToCart')} (${cartQty})` : t('addToCart')}
                title={isAddedToCart ? `${t('addToCart')} (${cartQty})` : t('addToCart')}
              >
                <CartTwo />
                {isAddedToCart && <span className="cart-btn-count cart-btn-count--card">{formatCountBadge(cartQty)}</span>}
              </button>
              <button
                type="button"
                className={`product-action-btn product__card-action-btn product-action-btn--mobile product-action-btn--secondary ${isWishlistAdded ? "active" : ""}`}
                onClick={() => handleAddWishlist(product)}
                aria-label={t('addToWishlist')}
                aria-pressed={isWishlistAdded}
              >
                <HeartTwo />
                <span className="product-action-tooltip">{t('addToWishlist')}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </React.Fragment>
  );

};

export default SingleProduct;

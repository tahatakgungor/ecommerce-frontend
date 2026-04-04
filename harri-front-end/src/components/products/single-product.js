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

const SingleProduct = ({ product, discountPrd = false }) => {
  const { _id, image, title, price, discount = 0, originalPrice } = product || {};
  const productImage = image || PRODUCT_IMAGE_FALLBACK;
  const dispatch = useDispatch();
  const { cart_products } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const isWishlistAdded = wishlist.some(item => item._id === _id);
  const isAddedToCart = cart_products.some((prd) => prd._id === _id);
  const { t } = useLanguage();

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
        <div className="product__thumb w-img p-relative fix">
          <Link href={`/product-details/${_id}`}>
            <Image
              src={productImage}
              alt="product image"
              width={960}
              height={1125}
              unoptimized={isExternalMediaUrl(productImage)}
              onError={buildImageErrorFallbackHandler(PRODUCT_IMAGE_FALLBACK)}
              sizes="(max-width: 576px) 50vw, (max-width: 992px) 33vw, 25vw"
              style={{ width: "100%", height: "auto", objectFit: "cover" }}
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

          {/* Desktop hover actions */}
          <div className="product__action d-none d-md-flex flex-column flex-wrap">
            <button
              type="button"
              className={`product-action-btn ${isWishlistAdded?"active":""}`}
              onClick={() => handleAddWishlist(product)}
            >
              <HeartTwo />
              <span className="product-action-tooltip">{t('addToWishlist')}</span>
            </button>
            <Link href={`/product-details/${_id}`}>
              <button type="button" className="product-action-btn">
                <i className="fa-solid fa-link"></i>
                <span className="product-action-tooltip">{t('productDetails')}</span>
              </button>
            </Link>
          </div>

          {/* Desktop: Add to Cart (on hover) */}
          <div className="product__add transition-3 d-none d-md-block">
            {isAddedToCart ? (
              <Link
                href="/cart"
                type="button"
                className="product-add-cart-btn w-100"
              >
                <CartTwo />
                {t('viewCart')}
              </Link>
            ) : (
              <button
                onClick={() => handleQuickView(product)}
                type="button"
                className="product-add-cart-btn w-100"
              >
                <CartTwo />
                {t('addToCart')}
              </button>
            )}
          </div>
        </div>

        <div className="product__content">
          <ProductRatingSummary
            productId={_id}
            compact
            className="tp-rating-summary--card mb-6"
          />
          <h3 className="product__title">
            <Link href={`/product-details/${_id}`}>{title}</Link>
          </h3>
          {discount <= 0 && (
            <div className="product__price">
              <span className="product__ammount">
                ₺{originalPrice.toFixed(2)}
              </span>
            </div>
          )}
          {discount > 0 && (
            <OldNewPrice originalPrice={originalPrice} discount={discount} />
          )}

          {/* Mobile: Always-visible action buttons */}
          <div className="product__mobile-actions d-flex d-md-none align-items-center gap-2 mt-2">
            {isAddedToCart ? (
              <Link
                href="/cart"
                className="product-add-cart-btn product-add-cart-btn--mobile text-center"
                aria-label={t('viewCart')}
                title={t('viewCart')}
              >
                <CartTwo />
              </Link>
            ) : (
              <button
                onClick={() => handleQuickView(product)}
                type="button"
                className="product-add-cart-btn product-add-cart-btn--mobile"
                aria-label={t('addToCart')}
                title={t('addToCart')}
              >
                <CartTwo />
              </button>
            )}
            <button
              type="button"
              className={`product-action-btn product-action-btn--mobile ${isWishlistAdded ? "active" : ""}`}
              onClick={() => handleAddWishlist(product)}
              aria-label={t('addToWishlist')}
            >
              <HeartTwo />
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );

};

export default SingleProduct;

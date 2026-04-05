'use client';
import React from "react";
import Image from "next/image";
import Link from "next/link";
// internal
import { CartTwo, HeartTwo } from "@svg/index";
import { useDispatch, useSelector } from "react-redux";
import { initialOrderQuantity } from "src/redux/features/cartSlice";
import { add_to_wishlist } from "src/redux/features/wishlist-slice";
import { setProduct } from "src/redux/features/productSlice";
import { useLanguage } from "src/context/LanguageContext";
import OldNewPrice from "./old-new-price";
import ProductRatingSummary from "./product-rating-summary";
import {
  PRODUCT_IMAGE_FALLBACK,
  buildImageErrorFallbackHandler,
  isExternalMediaUrl,
} from "src/utils/media-url";

const SingleListProduct = ({ product }) => {
  const { _id, image, title, price, discount, originalPrice } = product || {};
  const productImage = image || PRODUCT_IMAGE_FALLBACK;
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { cart_products } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const isAddedToCart = cart_products.some((prd) => prd._id === _id);
  const isWishlistAdded = wishlist.some((item) => item._id === _id);

  const handleAddWishlist = () => {
    dispatch(add_to_wishlist(product));
  };

  const handleQuickView = () => {
    dispatch(initialOrderQuantity());
    dispatch(setProduct(product));
  };

  return (
    <React.Fragment>
      <div className="product__list-item mb-30">
        <div className="row">
          <div className="col-xl-5 col-lg-5">
            <div className="product__thumb product__list-thumb p-relative fix m-img">
              <Link href={`product-details/${_id}`}>
                <Image
                  src={productImage}
                  alt="image"
                  width={335}
                  height={325}
                  unoptimized={isExternalMediaUrl(productImage)}
                  onError={buildImageErrorFallbackHandler(PRODUCT_IMAGE_FALLBACK)}
                  sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 335px"
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                  }}
                />
              </Link>
              {discount > 0 && (
                <div className="product__badge d-flex flex-column flex-wrap">
                  <span className={`product__badge-item has-new`}>sale</span>
                </div>
              )}
            </div>
          </div>
          <div className="col-xl-7 col-lg-7">
            <div className="product__list-content">
              <ProductRatingSummary productId={_id} className="mb-10" />

              <h3 className="product__list-title">
                <Link href={`product-details/${_id}`}>{title}</Link>
              </h3>
              <div className="product__list-price">
                {discount > 0 ? (
                  <OldNewPrice originalPrice={originalPrice} discount={discount} price={price} />
                ) : (
                  <span className="product__list-ammount">₺{originalPrice?.toFixed(2) ?? price}</span>
                )}
              </div>

              <div className="product__list-action d-flex flex-wrap align-items-center">
                {isAddedToCart ? (
                  <Link
                    href="/cart"
                    className="product-add-cart-btn product-add-cart-btn-2"
                  >
                    <CartTwo />
                    {t('viewCart')}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleQuickView}
                    className="product-add-cart-btn product-add-cart-btn-2"
                  >
                    <CartTwo />
                    {t('addToCart')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAddWishlist}
                  className={`product-action-btn product-action-btn-2 ${isWishlistAdded ? "active" : ""}`}
                >
                  <HeartTwo />
                  <span className="product-action-tooltip">
                    {t('addToWishlist')}
                  </span>
                </button>
                <Link href={`/product-details/${_id}`}>
                  <button
                    type="button"
                    className="product-action-btn product-action-btn-2"
                  >
                    <i className="fa-solid fa-link"></i>
                    <span className="product-action-tooltip">
                      {t('productDetails')}
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default SingleListProduct;

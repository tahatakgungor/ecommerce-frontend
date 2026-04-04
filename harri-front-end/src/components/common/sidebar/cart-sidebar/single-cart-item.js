import React from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { remove_product } from "src/redux/features/cartSlice";
import ProductRatingSummary from "@components/products/product-rating-summary";
import {
  PRODUCT_IMAGE_FALLBACK,
  buildImageErrorFallbackHandler,
  isExternalMediaUrl,
} from "src/utils/media-url";

const SingleCartItem = ({ item }) => {
  const { _id, image, originalPrice, title, orderQuantity, discount } =
    item || {};
  const productImage = image || PRODUCT_IMAGE_FALLBACK;
  const dispatch = useDispatch();

  // handle remove cart
  const handleRemoveProduct = (prd) => {
    dispatch(remove_product(prd));
  };
  return (
    <div className="cartmini__widget-item">
      {image && (
        <div className="cartmini__thumb">
          <Link href={`/product-details/${_id}`}>
            <Image
              src={productImage}
              alt="cart img"
              width={70}
              height={90}
              unoptimized={isExternalMediaUrl(productImage)}
              onError={buildImageErrorFallbackHandler(PRODUCT_IMAGE_FALLBACK)}
            />
          </Link>
        </div>
      )}
      <div className="cartmini__content">
        <h5>
          <a href={`/product-details/${_id}`}>{title}</a>
        </h5>
        <ProductRatingSummary productId={_id} compact className="tp-rating-summary--card mb-4" />
        <div className="cartmini__price-wrapper">
          {!discount && (
            <span className="cartmini__price">₺{originalPrice}</span>
          )}
          {discount > 0 && (
            <span className="cartmini__price">
              ₺
              {(originalPrice - (originalPrice * discount) / 100).toFixed(2)}
            </span>
          )}
          <span className="cartmini__quantity">x{orderQuantity}</span>
        </div>
      </div>
      <button
        className="cartmini__del"
        onClick={() => handleRemoveProduct(item)}
      >
        <i className="fal fa-times"></i>
      </button>
    </div>
  );
};

export default SingleCartItem;

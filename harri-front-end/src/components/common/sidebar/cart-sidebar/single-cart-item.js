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

const SingleCartItem = ({ item, setIsCartOpen }) => {
  const { _id, image, originalPrice, price, title, orderQuantity, discount } =
    item || {};
  const productImage = image || PRODUCT_IMAGE_FALLBACK;
  const dispatch = useDispatch();
  const currentPrice =
    Number.isFinite(Number(price))
      ? Number(price)
      : (discount && discount > 0
          ? (originalPrice - (originalPrice * discount) / 100)
          : originalPrice);

  // handle remove cart
  const handleRemoveProduct = (prd) => {
    dispatch(remove_product(prd));
  };
  return (
    <div className="cartmini__widget-item">
      {image && (
        <div className="cartmini__thumb">
          <Link onClick={() => setIsCartOpen(false)} href={`/product-details/${_id}`}>
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
          <Link onClick={() => setIsCartOpen(false)} href={`/product-details/${_id}`}>
            {title}
          </Link>
        </h5>
        <ProductRatingSummary productId={_id} compact className="tp-rating-summary--card mb-4" />
        <div className="cartmini__price-wrapper">
          <span className="cartmini__price">₺{Number(currentPrice || 0).toFixed(2)}</span>
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

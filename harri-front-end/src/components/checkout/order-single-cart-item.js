import React from "react";
import Image from "next/image";
import Link from "next/link";
import ProductRatingSummary from "@components/products/product-rating-summary";
import {
  PRODUCT_IMAGE_FALLBACK,
  buildImageErrorFallbackHandler,
  isExternalMediaUrl,
} from "src/utils/media-url";

const OrderSingleCartItem = ({ productId, image, title, quantity, price }) => {
  const productImage = image || PRODUCT_IMAGE_FALLBACK;

  return (
    <tr className="cart_item">
      <td className="product-name">
        <div className="checkout-order-item">
          <div className="checkout-order-item__thumb">
            {productId ? (
              <Link href={`/product-details/${productId}`}>
                <Image
                  src={productImage}
                  alt={title || "product"}
                  width={52}
                  height={52}
                  unoptimized={isExternalMediaUrl(productImage)}
                  onError={buildImageErrorFallbackHandler(PRODUCT_IMAGE_FALLBACK)}
                />
              </Link>
            ) : (
              <Image
                src={productImage}
                alt={title || "product"}
                width={52}
                height={52}
                unoptimized={isExternalMediaUrl(productImage)}
                onError={buildImageErrorFallbackHandler(PRODUCT_IMAGE_FALLBACK)}
              />
            )}
          </div>
          <div className="checkout-order-item__content">
            {productId ? (
              <Link href={`/product-details/${productId}`}>{title}</Link>
            ) : (
              title
            )}
            <strong className="product-quantity"> × {quantity}</strong>
            {productId && (
              <div className="checkout-order-item__rating">
                <ProductRatingSummary productId={productId} compact className="tp-rating-summary--card" />
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="product-total text-end">
        <span className="amount">₺{price}</span>
      </td>
    </tr>
  );
};

export default OrderSingleCartItem;

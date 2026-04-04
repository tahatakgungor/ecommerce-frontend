import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
// internal
import { Minus, Plus } from "@svg/index";
import { add_cart_product, quantityDecrement, remove_product } from "src/redux/features/cartSlice";
import ProductRatingSummary from "@components/products/product-rating-summary";
import {
  PRODUCT_IMAGE_FALLBACK,
  buildImageErrorFallbackHandler,
  isExternalMediaUrl,
} from "src/utils/media-url";

const SingleCartItem = ({ item }) => {
  const { _id, image, title, originalPrice, orderQuantity = 0, discount } = item || {};
  const productImage = image || PRODUCT_IMAGE_FALLBACK;
  const dispatch = useDispatch();
  const currentPrice = discount && discount > 0
    ? (originalPrice - (originalPrice * discount) / 100)
    : originalPrice;

  const handleAddProduct = (prd) => dispatch(add_cart_product(prd));
  const handleDecrement = (prd) => dispatch(quantityDecrement(prd));
  const handleRemovePrd = (prd) => dispatch(remove_product(prd));

  return (
    <div className="tp-cart-card d-flex flex-wrap flex-md-nowrap align-items-center justify-content-between gap-3 mb-3 p-3 bg-white rounded shadow-sm">
      {/* Group: Image + Info */}
      <div className="d-flex align-items-center gap-3 flex-grow-1 tp-cart-card__main">
        {/* Image */}
        <div className="flex-shrink-0">
          <Link href={`/product-details/${_id}`}>
            <Image
              src={productImage}
              alt={title}
              width={90}
              height={90}
              unoptimized={isExternalMediaUrl(productImage)}
              onError={buildImageErrorFallbackHandler(PRODUCT_IMAGE_FALLBACK)}
              style={{ objectFit: "cover", borderRadius: "8px" }}
            />
          </Link>
        </div>

        {/* Name & Price */}
        <div className="flex-grow-1">
          <Link href={`/product-details/${_id}`} style={{ fontWeight: 600, color: "#333", fontSize: "15px", display: "block" }}>
            {title}
          </Link>
          <ProductRatingSummary productId={_id} compact className="tp-rating-summary--card mt-4 mb-4" />
          <div style={{ color: "#888", fontSize: "13px", marginTop: "4px" }}>
            ₺{currentPrice.toFixed(2)} / adet
          </div>
        </div>
      </div>

      {/* Group: Quantity + Subtotal + Remove */}
      <div className="d-flex flex-wrap align-items-center gap-3 justify-content-between justify-content-md-end w-100 w-md-auto mt-2 mt-md-0" style={{ flex: "1 1 auto" }}>
        
        {/* Quantity Controls */}
        <div className="tp-product-quantity flex-shrink-0 scale-sm">
          <button type="button" className="tp-cart-minus" onClick={() => handleDecrement(item)}>
            <Minus />
          </button>
          <input
            className="tp-cart-input"
            type="text"
            value={orderQuantity}
            onChange={() => {}}
            readOnly
          />
          <button type="button" className="tp-cart-plus" onClick={() => handleAddProduct(item)}>
            <Plus />
          </button>
        </div>

        {/* Subtotal */}
        <div className="tp-cart-card__subtotal" style={{ textAlign: "right", fontWeight: 700, color: "#333" }}>
          ₺{(currentPrice * orderQuantity).toFixed(2)}
        </div>

        {/* Remove */}
        <button
          type="button"
          onClick={() => handleRemovePrd(item)}
          style={{ background: "none", border: "none", color: "#aaa", fontSize: "18px", cursor: "pointer", padding: "4px 8px" }}
          title="Kaldır"
        >
          <i className="fa fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default SingleCartItem;

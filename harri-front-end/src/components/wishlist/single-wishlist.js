import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useDispatch } from "react-redux";
// internal
import { remove_wishlist_product } from "src/redux/features/wishlist-slice";
import { initialOrderQuantity } from "src/redux/features/cartSlice";
import { setProduct } from "src/redux/features/productSlice";
import { useLanguage } from "src/context/LanguageContext";
import ProductRatingSummary from "@components/products/product-rating-summary";
import {
  PRODUCT_IMAGE_FALLBACK,
  buildImageErrorFallbackHandler,
  isExternalMediaUrl,
} from "src/utils/media-url";

const SingleWishlist = ({ item }) => {
  const { _id, image, title, originalPrice, discount } = item || {};
  const productImage = image || PRODUCT_IMAGE_FALLBACK;
  const dispatch = useDispatch();
  const { t } = useLanguage();

  const currentPrice = discount && discount > 0
    ? (originalPrice - (originalPrice * discount) / 100)
    : originalPrice;

  const handleQuickView = (prd) => {
    dispatch(initialOrderQuantity());
    dispatch(setProduct(prd));
  };
  const handleRemovePrd = (prd) => dispatch(remove_wishlist_product(prd));

  return (
    <div className="tp-cart-card d-flex flex-wrap flex-md-nowrap align-items-center justify-content-between gap-3 mb-3 p-3 bg-white rounded shadow-sm">
      
      {/* Group: Image + Info */}
      <div className="d-flex align-items-center gap-3 flex-grow-1" style={{ minWidth: "250px" }}>
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

      {/* Group: Add to Cart (Quick View) + Remove */}
      <div className="d-flex flex-wrap align-items-center gap-3 justify-content-between justify-content-md-end w-100 w-md-auto mt-2 mt-md-0" style={{ flex: "1 1 auto" }}>
        <button
          type="button"
          onClick={() => handleQuickView(item)}
          className="product-add-cart-btn product-add-cart-btn-2"
        >
          {t('addToCart')}
        </button>

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

export default SingleWishlist;

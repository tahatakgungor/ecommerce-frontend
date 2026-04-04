import React from "react";
import Link from "next/link";
import ProductRatingSummary from "@components/products/product-rating-summary";

const OrderSingleCartItem = ({ productId, title, quantity, price }) => {
  return (
    <tr className="cart_item">
      <td className="product-name">
        {productId ? (
          <Link href={`/product-details/${productId}`}>{title}</Link>
        ) : (
          title
        )}
        <strong className="product-quantity"> × {quantity}</strong>
        {productId && (
          <div style={{ marginTop: 6 }}>
            <ProductRatingSummary productId={productId} compact className="tp-rating-summary--card" />
          </div>
        )}
      </td>
      <td className="product-total text-end">
        <span className="amount">₺{price}</span>
      </td>
    </tr>
  );
};

export default OrderSingleCartItem;

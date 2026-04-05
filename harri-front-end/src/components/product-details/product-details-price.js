import React from "react";

const ProductDetailsPrice = ({ originalPrice, price, discount }) => {
  const hasDirectPrice = Number.isFinite(Number(price));
  const nextPrice = hasDirectPrice
    ? Number(price)
    : Number(originalPrice) - (Number(originalPrice) * Number(discount)) / 100;

  return (
    <div className="product__details-price">
      {discount > 0 ? (
        <>
          <span className="product__details-ammount old-ammount">₺{originalPrice}</span>
          <span className="product__details-ammount new-ammount">
            ₺{nextPrice.toFixed(2)}
          </span>
          <span className="product__details-offer">-{discount}%</span>
        </>
      ) : (
        <>
          <span className="product__details-ammount new-ammount">₺{Number(price ?? originalPrice).toFixed(2)}</span>
        </>
      )}
    </div>
  );
};

export default ProductDetailsPrice;

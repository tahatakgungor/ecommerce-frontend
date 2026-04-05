import React from "react";

const OldNewPrice = ({ originalPrice, discount, price }) => {
  const normalizedOriginal = Number.isFinite(Number(originalPrice))
    ? Number(originalPrice)
    : 0;
  const hasDirectPrice = Number.isFinite(Number(price));
  const fallbackByDiscount =
    normalizedOriginal - (normalizedOriginal * Number(discount || 0)) / 100;
  const nextPrice = hasDirectPrice ? Number(price) : fallbackByDiscount;
  const hasDiscount = normalizedOriginal > 0 && nextPrice < normalizedOriginal;

  return (
    <div className="product__price">
      {hasDiscount ? (
        <del className="product__ammount old-price">
          ₺{normalizedOriginal.toFixed(2)}
        </del>
      ) : null}
      <span className="product__ammount new-price">
        ₺{nextPrice.toFixed(2)}
      </span>
    </div>
  );
};

export default OldNewPrice;

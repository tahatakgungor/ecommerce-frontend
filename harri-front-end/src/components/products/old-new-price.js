import React from "react";

const OldNewPrice = ({ originalPrice, discount, price }) => {
  const hasDirectPrice = Number.isFinite(Number(price));
  const nextPrice = hasDirectPrice
    ? Number(price)
    : Number(originalPrice) - (Number(originalPrice) * Number(discount)) / 100;

  return (
    <div className="product__price">
      <del className="product__ammount old-price">
        ₺{originalPrice.toFixed(2)}
      </del>
      <span className="product__ammount new-price">
        {" "}
        ₺
        {nextPrice.toFixed(2)}
      </span>
    </div>
  );
};

export default OldNewPrice;

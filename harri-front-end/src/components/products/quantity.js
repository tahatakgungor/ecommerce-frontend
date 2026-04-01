import React, { useState } from "react";
// internal
import { Minus, Plus } from "@svg/index";
import { useDispatch, useSelector } from "react-redux";
import { decrement, increment } from "src/redux/features/cartSlice";


const Quantity = () => {
  const dispatch = useDispatch();
  const {orderQuantity} = useSelector(state => state.cart);
  const [quantity,setQuantity] = useState(1);
  // handleIncrease
  const handleIncrease = () => {
    dispatch(increment())
  }
  // handleDecrease
  const handleDecrease = () => {
    dispatch(decrement())
  }
  return (
    <div className="product__details-quantity">
      <div className="tp-product-quantity mt-10 mb-10">
        <button type="button" className="tp-cart-minus" onClick={handleDecrease} aria-label="Miktarı azalt">
          <Minus />
        </button>
        <input
          className="tp-cart-input"
          type="text"
          value={orderQuantity}
          readOnly
          aria-label="Ürün miktarı"
        />
        <button type="button" className="tp-cart-plus" onClick={handleIncrease} aria-label="Miktarı artır">
          <Plus />
        </button>
      </div>
    </div>
  );
};

export default Quantity;

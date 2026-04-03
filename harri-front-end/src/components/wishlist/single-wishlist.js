import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
// internal
import { Minus, Plus } from "@svg/index";
import { remove_wishlist_product } from "src/redux/features/wishlist-slice";
import { add_cart_product, quantityDecrement } from "src/redux/features/cartSlice";

const SingleWishlist = ({ item }) => {
  const { _id, image, title, originalPrice, discount } = item || {};
  const { cart_products } = useSelector((state) => state.cart);
  const isAddToCart = cart_products.find((p) => p._id === _id);
  const dispatch = useDispatch();

  const currentPrice = discount && discount > 0
    ? (originalPrice - (originalPrice * discount) / 100)
    : originalPrice;

  const handleAddProduct = (prd) => dispatch(add_cart_product(prd));
  const handleDecrement = (prd) => dispatch(quantityDecrement(prd));
  const handleRemovePrd = (prd) => dispatch(remove_wishlist_product(prd));

  return (
    <div className="tp-cart-card d-flex align-items-center gap-3 mb-3 p-3 bg-white rounded shadow-sm">
      {/* Image */}
      <div className="flex-shrink-0">
        <Link href={`/product-details/${_id}`}>
          <Image src={image} alt={title} width={90} height={90} style={{ objectFit: "cover", borderRadius: "8px" }} />
        </Link>
      </div>

      {/* Name & Price */}
      <div className="flex-grow-1">
        <Link href={`/product-details/${_id}`} style={{ fontWeight: 600, color: "#333", fontSize: "15px" }}>
          {title}
        </Link>
        <div style={{ color: "#888", fontSize: "13px", marginTop: "4px" }}>
          ₺{currentPrice.toFixed(2)} / adet
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="tp-product-quantity d-flex align-items-center" style={{ minWidth: "110px" }}>
        <span className="tp-cart-minus" onClick={() => handleDecrement(item)} style={{ cursor: "pointer" }}>
          <Minus />
        </span>
        <input
          className="tp-cart-input"
          type="text"
          value={isAddToCart ? isAddToCart.orderQuantity : 0}
          onChange={() => {}}
          style={{ width: "40px", textAlign: "center" }}
          readOnly
        />
        <span className="tp-cart-plus" onClick={() => handleAddProduct(item)} style={{ cursor: "pointer" }}>
          <Plus />
        </span>
      </div>

      {/* Subtotal */}
      <div style={{ minWidth: "80px", textAlign: "right", fontWeight: 700, color: "#333" }}>
        ₺{isAddToCart ? (currentPrice * isAddToCart.orderQuantity).toFixed(2) : "0.00"}
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
  );
};

export default SingleWishlist;

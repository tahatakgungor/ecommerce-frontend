export const getProductQtyInCart = (cartProducts, productId) => {
  if (!Array.isArray(cartProducts) || !productId) return 0;
  const item = cartProducts.find((prd) => prd?._id === productId);
  return Number(item?.orderQuantity || 0);
};

export const formatCountBadge = (count) => {
  const safe = Number.isFinite(Number(count)) ? Number(count) : 0;
  if (safe <= 0) return "0";
  return safe > 99 ? "99+" : String(safe);
};

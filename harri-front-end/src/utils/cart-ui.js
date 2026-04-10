export const getProductQtyInCart = (cartProducts, productId) => {
  if (!Array.isArray(cartProducts) || !productId) return 0;
  const item = cartProducts.find((prd) => prd?._id === productId);
  return Number(item?.orderQuantity || 0);
};


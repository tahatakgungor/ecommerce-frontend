export function buildReviewedLookup(reviewRows = []) {
  return (Array.isArray(reviewRows) ? reviewRows : []).reduce((acc, row) => {
    const review = row?.review || {};
    const productId = row?.productId || review?.productId;
    if (productId) {
      acc[productId] = row;
    }
    return acc;
  }, {});
}

export function getReviewItemsForOrder(selectedOrder, reviewedLookup = {}) {
  const cartItems = Array.isArray(selectedOrder?.cart) ? selectedOrder.cart : [];

  return cartItems
    .map((item) => {
      const productId = item?._id || item?.id;
      if (!productId) return null;

      return {
        productId,
        orderId: selectedOrder?._id,
        title: item?.title,
        image: item?.image,
        ...(reviewedLookup[productId] || {}),
      };
    })
    .filter(Boolean);
}

export function buildOrderReviewRedirectPath(pathname, searchParams) {
  const nextParams = new URLSearchParams(searchParams?.toString?.() || "");
  nextParams.set("openReview", "1");
  return `/login?redirect=${encodeURIComponent(`${pathname}${nextParams.toString() ? `?${nextParams.toString()}` : ""}`)}`;
}

export function clearReviewIntentFromPath(pathname, searchParams) {
  const nextParams = new URLSearchParams(searchParams?.toString?.() || "");
  nextParams.delete("openReview");
  return nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
}

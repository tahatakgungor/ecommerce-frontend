import { createSlice } from "@reduxjs/toolkit";
import { getLocalStorage, setLocalStorage } from "@utils/localstorage";
import { notifyError, notifySuccess } from "@utils/toast";

const initialState = {
  cart_products: [],
  orderQuantity: 1,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    add_cart_product: (state, { payload }) => {
      const requestedQty = Number.isFinite(Number(state.orderQuantity))
        ? Math.max(1, Number(state.orderQuantity))
        : 1;
      const isExist = state.cart_products.some((i) => i._id === payload._id);
      if (!isExist) {
        if (
          Number.isFinite(Number(payload?.quantity)) &&
          Number(payload.quantity) > 0 &&
          requestedQty > Number(payload.quantity)
        ) {
          notifyError("No more quantity available for this product!");
          state.orderQuantity = 1;
          return;
        }
        const newItem = {
          ...payload,
          orderQuantity: requestedQty,
        };
        state.cart_products.push(newItem);
        notifySuccess(`${newItem.orderQuantity} ${payload.title} added to cart`);
      } else {
        state.cart_products.map((item) => {
          if (item._id === payload._id) {
            if (item.quantity >= item.orderQuantity + requestedQty) {
              item.orderQuantity =
                requestedQty !== 1
                  ? requestedQty + item.orderQuantity
                  : item.orderQuantity + 1;
              notifySuccess(`${requestedQty} ${item.title} added to cart`);
            } else {
              notifyError("No more quantity available for this product!");
              state.orderQuantity = 1;
            }
          }
          return { ...item };
        });
      }
      setLocalStorage("cart_products", state.cart_products);
    },
    increment: (state, { payload }) => {
      state.orderQuantity = state.orderQuantity + 1;
    },
    decrement: (state, { payload }) => {
      state.orderQuantity =
        state.orderQuantity > 1
          ? state.orderQuantity - 1
          : (state.orderQuantity = 1);
    },
    quantityDecrement: (state, { payload }) => {
      state.cart_products.map((item) => {
        if (item._id === payload._id) {
          if (item.orderQuantity > 1) {
            item.orderQuantity = item.orderQuantity - 1;
          }
        }
        return { ...item };
      });
      setLocalStorage("cart_products", state.cart_products);
    },
    remove_product: (state, { payload }) => {
      state.cart_products = state.cart_products.filter(
        (item) => item._id !== payload._id
      );
      setLocalStorage("cart_products", state.cart_products);
    },
    get_cart_products: (state, action) => {
      state.cart_products = getLocalStorage("cart_products");
    },
    initialOrderQuantity: (state, { payload }) => {
      state.orderQuantity = 1;
    },
    clear_cart: (state) => {
      state.cart_products = [];
      state.orderQuantity = 1;
      setLocalStorage("cart_products", []);
    },
  },
});

export const {
  add_cart_product,
  increment,
  decrement,
  get_cart_products,
  remove_product,
  quantityDecrement,
  initialOrderQuantity,
  clear_cart,
} = cartSlice.actions;
export default cartSlice.reducer;

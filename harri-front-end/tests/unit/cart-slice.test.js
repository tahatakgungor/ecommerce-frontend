import { describe, expect, it, vi } from "vitest";
import cartReducer, { add_cart_product, increment, initialOrderQuantity } from "../../src/redux/features/cartSlice";

vi.mock("@utils/toast", () => ({
  notifySuccess: vi.fn(),
  notifyError: vi.fn(),
}));

vi.mock("@utils/localstorage", () => ({
  getLocalStorage: vi.fn(() => []),
  setLocalStorage: vi.fn(),
}));

describe("cartSlice add_cart_product", () => {
  const product = {
    _id: "prd-1",
    title: "Demo Product",
    quantity: 10,
  };

  it("adds a new product with selected quick-view quantity", () => {
    let state = cartReducer(undefined, { type: "@@INIT" });
    state = cartReducer(state, increment());
    state = cartReducer(state, increment());
    expect(state.orderQuantity).toBe(3);

    state = cartReducer(state, add_cart_product(product));
    expect(state.cart_products).toHaveLength(1);
    expect(state.cart_products[0].orderQuantity).toBe(3);
  });

  it("resets selected quantity when modal flow re-opens", () => {
    let state = cartReducer(undefined, { type: "@@INIT" });
    state = cartReducer(state, increment());
    expect(state.orderQuantity).toBe(2);
    state = cartReducer(state, initialOrderQuantity());
    expect(state.orderQuantity).toBe(1);
  });
});

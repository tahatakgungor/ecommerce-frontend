import { PropsWithChildren } from "react";

import { CartProvider } from "@/modules/cart/cart-provider";
import { CheckoutProvider } from "@/modules/checkout/checkout-provider";
import { SessionProvider } from "@/modules/auth/session-provider";

export function RootProvider({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <CheckoutProvider>
        <CartProvider>{children}</CartProvider>
      </CheckoutProvider>
    </SessionProvider>
  );
}

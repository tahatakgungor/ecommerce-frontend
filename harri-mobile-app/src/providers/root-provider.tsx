import { PropsWithChildren } from "react";

import { CartProvider } from "@/modules/cart/cart-provider";
import { SessionProvider } from "@/modules/auth/session-provider";

export function RootProvider({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}

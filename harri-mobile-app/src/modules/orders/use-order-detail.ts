import { startTransition, useEffect, useState } from "react";

import { fetchUserOrderDetail, lookupGuestOrder } from "@/modules/orders/api";
import type { GuestLookupPayload, OrderDetail } from "@/modules/orders/types";

type OrderDetailState = {
  data: OrderDetail | null;
  isLoading: boolean;
  error: string | null;
};

export function useOrderDetail(orderId: string, guestLookup: GuestLookupPayload | null) {
  const [state, setState] = useState<OrderDetailState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    if (!orderId) {
      setState({
        data: null,
        isLoading: false,
        error: "Siparis kimligi eksik.",
      });
      return () => {
        active = false;
      };
    }

    setState({
      data: null,
      isLoading: true,
      error: null,
    });

    const request = guestLookup ? lookupGuestOrder(guestLookup) : fetchUserOrderDetail(orderId);
    request
      .then((data) => {
        if (!active) return;
        startTransition(() => {
          setState({
            data,
            isLoading: false,
            error: null,
          });
        });
      })
      .catch((error) => {
        if (!active) return;
        startTransition(() => {
          setState({
            data: null,
            isLoading: false,
            error: error instanceof Error ? error.message : "Siparis yuklenemedi.",
          });
        });
      });

    return () => {
      active = false;
    };
  }, [guestLookup?.email, guestLookup?.invoice, orderId]);

  return state;
}

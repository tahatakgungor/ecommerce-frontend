import { startTransition, useEffect, useState } from "react";

import { toUserFriendlyErrorMessage } from "@/lib/http-client";
import { fetchProductDetail, getLocalProductDetail } from "@/modules/catalog/api";
import type { CatalogProduct } from "@/modules/catalog/types";

type ProductDetailState = {
  data: CatalogProduct | null;
  isLoading: boolean;
  error: string | null;
};

export function useProductDetail(productId: string) {
  const [state, setState] = useState<ProductDetailState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    if (!productId) {
      setState({
        data: null,
        isLoading: false,
        error: "Ürün kimliği eksik.",
      });
      return () => {
        active = false;
      };
    }

    setState((current) => ({
      data: current.data && current.data.id === productId ? current.data : null,
      isLoading: !current.data || current.data.id !== productId,
      error: null,
    }));

    getLocalProductDetail(productId).then((localProduct) => {
      if (!active || !localProduct) return;
      startTransition(() => {
        setState((current) => ({
          data: current.data || localProduct,
          isLoading: false,
          error: current.error,
        }));
      });
    });

    fetchProductDetail(productId)
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
            error: toUserFriendlyErrorMessage(error, "Ürün detayı yüklenemedi."),
          });
        });
      });

    return () => {
      active = false;
    };
  }, [productId]);

  return state;
}

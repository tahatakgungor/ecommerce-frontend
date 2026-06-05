import { fetchJson } from "@/lib/http-client";
import {
  normalizeCatalogSnapshot,
  normalizeProduct,
} from "@harri/commerce-contracts";
import type { CatalogProduct, CatalogSnapshot, RawCatalogResponse, RawProductResponse } from "@/modules/catalog/types";

export async function fetchCatalogSnapshot(page = 1, size = 8): Promise<CatalogSnapshot> {
  const payload = await fetchJson<RawCatalogResponse>(
    `/api/products/show?page=${page}&size=${size}&includeFacets=true`
  );
  return normalizeCatalogSnapshot(payload);
}

type ProductEnvelope = {
  data?: RawProductResponse;
  result?: RawProductResponse;
};

export async function fetchProductDetail(productId: string): Promise<CatalogProduct> {
  const payload = await fetchJson<RawProductResponse | ProductEnvelope>(`/api/products/${productId}`);
  const rawProduct =
    payload && typeof payload === "object" && ("data" in payload || "result" in payload)
      ? payload.data || payload.result
      : payload;

  return normalizeProduct((rawProduct || {}) as RawProductResponse);
}

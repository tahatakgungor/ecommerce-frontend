import { fetchJson } from "@/lib/http-client";
import { buildCatalogQueryParams, type CatalogQuery } from "@/modules/catalog/query";
import {
  normalizeCatalogSnapshot,
  normalizeProduct,
} from "@harri/commerce-contracts";
import type { CatalogProduct, CatalogSnapshot, RawCatalogResponse, RawProductResponse } from "@/modules/catalog/types";

export async function fetchCatalogSnapshot(query: CatalogQuery = {}): Promise<CatalogSnapshot> {
  const payload = await fetchJson<RawCatalogResponse>(`/api/products/show?${buildCatalogQueryParams(query)}`);
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

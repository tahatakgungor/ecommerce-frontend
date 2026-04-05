import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PRODUCT_IMAGE_FALLBACK,
  buildImageErrorFallbackHandler,
  isExternalMediaUrl,
  normalizeMediaUrl,
} from "src/utils/media-url";

const SingleCategory = ({ item }) => {
  const categoryLabel = item?.label || item?.parent || "Kategori";
  const categoryHref = item?.href || "/shop";
  const categoryImage = normalizeMediaUrl(item?.image) || PRODUCT_IMAGE_FALLBACK;

  return (
    <div className="product__category-item mb-20 text-center">
      <div className="product__category-thumb w-img position-relative overflow-hidden rounded-3" style={{ marginBottom: "8px" }}>
        <Link
          href={categoryHref}
          className="product__category-link"
          style={{
            cursor: "pointer",
            display: "block",
            position: "relative",
            background: "linear-gradient(120deg, #f8fafc 0%, #eef2f7 100%)",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            minHeight: "112px",
            boxShadow: "0 6px 14px rgba(17, 24, 39, 0.05)",
            overflow: "hidden",
          }}
        >
          <Image
            src={categoryImage}
            alt={categoryLabel}
            fill
            onError={buildImageErrorFallbackHandler(PRODUCT_IMAGE_FALLBACK)}
            unoptimized={isExternalMediaUrl(categoryImage)}
            sizes="(max-width: 576px) 45vw, (max-width: 992px) 30vw, 20vw"
            style={{ objectFit: "cover" }}
          />
        </Link>
      </div>
      <Link href={categoryHref} className="product__category-label" style={{ display: "block", color: "#0b1533", fontWeight: 700, fontSize: 14 }}>
        {categoryLabel}
      </Link>
    </div>
  );
};

export default SingleCategory;

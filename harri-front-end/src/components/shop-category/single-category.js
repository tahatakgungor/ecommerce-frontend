import Image from "next/image";
import React from "react";
import {
  buildImageErrorFallbackHandler,
} from "src/utils/media-url";
import Link from "next/link";

const CATEGORY_BACKGROUND_IMAGE = "/assets/img/product/category/category-green-bg.svg";

const SingleCategory = ({ item }) => {
  const categoryLabel = item?.label || item?.parent || "Kategori";
  const categoryHref = item?.href || "/shop";
  const subtitle = item?.subtitle || "";
  const isParent = item?.level === "parent";
  const imageSrc = CATEGORY_BACKGROUND_IMAGE;

  return (
    <div className="product__category-item mb-20 text-center">
      <div className="product__category-thumb w-img position-relative overflow-hidden rounded-3">
        <Link
          href={categoryHref}
          style={{ cursor: "pointer", display: "block", position: "relative" }}
        >
          <Image
            src={imageSrc}
            alt={`${categoryLabel} category`}
            width={272}
            height={181}
            onError={buildImageErrorFallbackHandler(CATEGORY_BACKGROUND_IMAGE)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <span
            style={{
              position: "absolute",
              inset: 0,
              background: isParent
                ? "linear-gradient(180deg, rgba(10,59,35,0.2) 0%, rgba(10,59,35,0.82) 100%)"
                : "linear-gradient(180deg, rgba(13,68,39,0.14) 0%, rgba(12,68,39,0.74) 100%)",
            }}
          />
          {!isParent && (
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "12px",
                color: "#d7ffe2",
                fontWeight: 600,
                fontSize: "13px",
                lineHeight: 1.2,
                textAlign: "left",
              }}
            >
              {subtitle}
            </span>
          )}
          <span
            style={{
              position: "absolute",
              left: "14px",
              right: "14px",
              bottom: "12px",
              color: "#fff",
              fontWeight: 700,
              fontSize: "20px",
              lineHeight: 1.2,
              textAlign: "left",
              textShadow: "0 2px 10px rgba(0,0,0,0.35)",
            }}
          >
            {categoryLabel}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default SingleCategory;

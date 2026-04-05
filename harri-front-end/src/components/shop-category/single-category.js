import React from "react";
import Link from "next/link";

const SingleCategory = ({ item }) => {
  const categoryLabel = item?.label || item?.parent || "Kategori";
  const categoryHref = item?.href || "/shop";
  const subtitle = item?.subtitle || "";
  const isParent = item?.level === "parent";

  return (
    <div className="product__category-item mb-20 text-center">
      <div className="product__category-thumb w-img position-relative overflow-hidden rounded-3">
        <Link
          href={categoryHref}
          style={{
            cursor: "pointer",
            display: "block",
            position: "relative",
            background: "#ffffff",
            border: "1px solid #e6ece8",
            borderRadius: "12px",
            minHeight: "180px",
            padding: "16px 14px",
            boxShadow: "0 8px 20px rgba(17, 24, 39, 0.05)",
          }}
        >
          {!isParent ? (
            <span
              style={{
                display: "inline-block",
                color: "#607a68",
                fontWeight: 600,
                fontSize: "12px",
                lineHeight: 1.2,
                textAlign: "left",
                marginBottom: "10px",
              }}
            >
              {subtitle}
            </span>
          ) : (
            <span
              style={{
                display: "inline-block",
                color: "#1f7a44",
                fontWeight: 700,
                fontSize: "12px",
                lineHeight: 1.2,
                textAlign: "left",
                marginBottom: "10px",
              }}
            >
              Ana Kategori
            </span>
          )}
          <span
            style={{
              display: "block",
              color: "#0b1533",
              fontWeight: 700,
              fontSize: "24px",
              lineHeight: 1.2,
              textAlign: "left",
              marginTop: "58px",
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

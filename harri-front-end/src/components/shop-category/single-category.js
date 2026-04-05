import React from "react";
import Link from "next/link";

const SingleCategory = ({ item }) => {
  const categoryLabel = item?.label || item?.parent || "Kategori";
  const categoryHref = item?.href || "/shop";

  return (
    <div className="product__category-item mb-20 text-center">
      <div className="product__category-thumb w-img position-relative overflow-hidden rounded-3" style={{ marginBottom: "10px" }}>
        <Link
          href={categoryHref}
          style={{
            cursor: "pointer",
            display: "block",
            position: "relative",
            background: "linear-gradient(120deg, #f8fafc 0%, #eef2f7 100%)",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            minHeight: "138px",
            boxShadow: "0 8px 20px rgba(17, 24, 39, 0.06)",
          }}
        />
      </div>
      <Link href={categoryHref} style={{ display: "block", color: "#0b1533", fontWeight: 700, fontSize: 16 }}>
        {categoryLabel}
      </Link>
    </div>
  );
};

export default SingleCategory;

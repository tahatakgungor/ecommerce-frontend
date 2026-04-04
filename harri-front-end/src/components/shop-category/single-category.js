import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { toFilterSlug } from "src/utils/shop-filters";
import {
  PRODUCT_IMAGE_FALLBACK,
  buildImageErrorFallbackHandler,
  isExternalMediaUrl,
} from "src/utils/media-url";

const CATEGORY_FALLBACK_IMAGES = [
  "/assets/img/product/category/product-cat-1.jpg",
  "/assets/img/product/category/product-cat-2.jpg",
  "/assets/img/product/category/product-cat-3.jpg",
  "/assets/img/product/category/product-cat-4.jpg",
];

const SingleCategory = ({ item }) => {
  const router = useRouter();
  const categoryLabel = item?.parent || "Kategori";
  const categoryHref = `/shop?Category=${toFilterSlug(categoryLabel)}`;
  const fallbackImage = CATEGORY_FALLBACK_IMAGES[toFilterSlug(categoryLabel).length % CATEGORY_FALLBACK_IMAGES.length];
  const imageSrc = item?.image || fallbackImage || PRODUCT_IMAGE_FALLBACK;

  return (
    <div className="product__category-item mb-20 text-center">
      <div className="product__category-thumb w-img position-relative overflow-hidden rounded-3">
        <a
          onClick={() => router.push(categoryHref)}
          style={{ cursor: "pointer", display: "block", position: "relative" }}
        >
          <Image
            src={imageSrc}
            alt="image"
            width={272}
            height={181}
            unoptimized={isExternalMediaUrl(imageSrc)}
            onError={buildImageErrorFallbackHandler(fallbackImage || PRODUCT_IMAGE_FALLBACK)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <span
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(16,24,40,0.08) 0%, rgba(16,24,40,0.6) 100%)",
            }}
          />
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
        </a>
      </div>
    </div>
  );
};

export default SingleCategory;

'use client';
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
// internal
import { HeartTwo, CartTwo } from "@svg/index";
import { SocialShare } from "@components/social";
import ProductDetailsPrice from "./product-details-price";
import ProductQuantity from "./product-quantity";
import ProductDetailsCategories from "./product-details-categories";
import ProductDetailsTags from "./product-details-tags";
import { add_cart_product } from "src/redux/features/cartSlice";
import { add_to_wishlist } from "src/redux/features/wishlist-slice";
import { useLanguage } from "src/context/LanguageContext";
import ProductRatingSummary from "@components/products/product-rating-summary";
import {
  PRODUCT_IMAGE_FALLBACK,
  buildImageErrorFallbackHandler,
  buildProductGalleryImages,
  isExternalMediaUrl,
} from "src/utils/media-url";

const ProductDetailsArea = ({ product }) => {
  const {
    _id,
    title,
    quantity,
    originalPrice,
    discount,
    tags,
    sku,
  } = product || {};
  const galleryImages = useMemo(() => buildProductGalleryImages(product), [product]);
  const [activeImg, setActiveImg] = useState(galleryImages[0] || "");
  const [isAdding, setIsAdding] = useState(false);
  useEffect(() => {
    setActiveImg(galleryImages[0] || "");
  }, [galleryImages]);

  const dispatch = useDispatch();
  const { wishlist } = useSelector((state) => state.wishlist);
  const isWishlistAdded = wishlist.some((item) => item._id === _id);
  const { t } = useLanguage();

  // handle add product
  const handleAddProduct = (prd) => {
    if (isAdding) return;
    setIsAdding(true);
    dispatch(add_cart_product(prd));
    setTimeout(() => setIsAdding(false), 600);
  };

  // handle add wishlist
  const handleAddWishlist = (prd) => {
    dispatch(add_to_wishlist(prd));
  };

  return (
    <section className="product__details-area pb-115">
      <div className="container">
        <div className="row">
          <div className="col-xl-7 col-lg-6">
            <div className="product__details-thumb-tab mr-70">
              <div className="product__details-thumb-content w-img">
                <div>
                  {activeImg ? (
                    <Image
                      src={activeImg}
                      alt="details img"
                      width={960}
                      height={1125}
                      unoptimized={isExternalMediaUrl(activeImg)}
                      onError={buildImageErrorFallbackHandler(PRODUCT_IMAGE_FALLBACK)}
                      sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 40vw"
                      style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: "575px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div style={{ width: "100%", aspectRatio: "4/3", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#9ca3af" }}>{t('noImage') || 'Resim Yok'}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="product__details-thumb-nav tp-tab">
                <nav>
                  <div className="d-flex justify-content-center flex-wrap">
                    {galleryImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(img)}
                        className={activeImg === img ? "nav-link active" : ""}
                      >
                        <Image
                          src={img}
                          alt="image"
                          width={110}
                          height={110}
                          unoptimized={isExternalMediaUrl(img)}
                          onError={buildImageErrorFallbackHandler(PRODUCT_IMAGE_FALLBACK)}
                        />
                      </button>
                    ))}
                  </div>
                </nav>
              </div>
            </div>
          </div>
          <div className="col-xl-5 col-lg-6">
            <div className="product__details-wrapper">
              {quantity > 0 && (
                <div className="product__details-stock">
                  <span>{t('inStock')}</span>
                </div>
              )}
              <h3 className="product__details-title">{title}</h3>
              <ProductRatingSummary productId={_id} className="tp-rating-summary--details mb-15" />

              {/* Product Details Price */}
              <ProductDetailsPrice price={originalPrice} discount={discount} />
              {/* Product Details Price */}

              {/* quantity */}
              <ProductQuantity />
              {/* quantity */}

              <div className="product__details-action d-flex flex-wrap align-items-center">
                <button
                  onClick={() => handleAddProduct(product)}
                  type="button"
                  className="product-add-cart-btn product-add-cart-btn-3"
                  disabled={isAdding}
                  style={{ opacity: isAdding ? 0.75 : 1, transition: 'opacity 0.2s' }}
                >
                  {isAdding ? (
                    <>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '16px',
                          height: '16px',
                          border: '2px solid currentColor',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite',
                          marginRight: '6px',
                          verticalAlign: 'middle',
                        }}
                      />
                      {t('addedToCart')}
                    </>
                  ) : (
                    <>
                      <CartTwo />
                      {t('cart')}
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleAddWishlist(product)}
                  type="button"
                  className={`product-action-btn ${
                    isWishlistAdded ? "active" : ""
                  }`}
                >
                  <HeartTwo />
                  <span className="product-action-tooltip">
                    {t('addToWishlist')}
                  </span>
                </button>
              </div>
              <div className="product__details-sku product__details-more">
                <p>{t('sku')}:</p>
                <span>{sku}</span>
              </div>
              {/* ProductDetailsCategories */}
              <ProductDetailsCategories name={product?.category?.name} />
              {/* ProductDetailsCategories */}

              {/* Tags */}
              <ProductDetailsTags tag={tags} />
              {/* Tags */}

              <div className="product__details-share">
                <span>{t('share')}:</span>
                <SocialShare />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsArea;

'use client';
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
    price,
    originalPrice,
    discount,
    tags,
    sku,
  } = product || {};
  const galleryImages = useMemo(() => buildProductGalleryImages(product), [product]);
  const [activeImg, setActiveImg] = useState(galleryImages[0] || "");
  const [isAdding, setIsAdding] = useState(false);
  const [lightbox, setLightbox] = useState({
    open: false,
    index: 0,
    zoom: 1,
  });
  useEffect(() => {
    setActiveImg(galleryImages[0] || "");
  }, [galleryImages]);
  const getImageIndex = (img) => {
    const index = galleryImages.findIndex((item) => item === img);
    return index >= 0 ? index : 0;
  };
  const closeLightbox = () => {
    setLightbox((prev) => ({ ...prev, open: false, zoom: 1 }));
  };
  const openLightbox = (img) => {
    setLightbox({
      open: true,
      index: getImageIndex(img || activeImg || galleryImages[0]),
      zoom: 1,
    });
  };
  const setLightboxIndex = useCallback((nextIndex) => {
    if (!galleryImages.length) return;
    const normalized = (nextIndex + galleryImages.length) % galleryImages.length;
    const nextImg = galleryImages[normalized];
    setActiveImg(nextImg);
    setLightbox((prev) => ({ ...prev, index: normalized }));
  }, [galleryImages]);
  const showPrevLightbox = useCallback(() => {
    setLightbox((prev) => {
      if (!galleryImages.length) return prev;
      const normalized = (prev.index - 1 + galleryImages.length) % galleryImages.length;
      setActiveImg(galleryImages[normalized]);
      return { ...prev, index: normalized };
    });
  }, [galleryImages]);
  const showNextLightbox = useCallback(() => {
    setLightbox((prev) => {
      if (!galleryImages.length) return prev;
      const normalized = (prev.index + 1) % galleryImages.length;
      setActiveImg(galleryImages[normalized]);
      return { ...prev, index: normalized };
    });
  }, [galleryImages]);
  const zoomIn = () =>
    setLightbox((prev) => ({ ...prev, zoom: Math.min(Number((prev.zoom + 0.25).toFixed(2)), 3) }));
  const zoomOut = () =>
    setLightbox((prev) => ({ ...prev, zoom: Math.max(Number((prev.zoom - 0.25).toFixed(2)), 1) }));
  const resetZoom = () => setLightbox((prev) => ({ ...prev, zoom: 1 }));

  useEffect(() => {
    if (!lightbox.open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        showPrevLightbox();
      } else if (event.key === "ArrowRight") {
        showNextLightbox();
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomIn();
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        zoomOut();
      } else if (event.key === "0") {
        event.preventDefault();
        resetZoom();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightbox.open, showNextLightbox, showPrevLightbox]);

  const dispatch = useDispatch();
  const { wishlist } = useSelector((state) => state.wishlist);
  const isWishlistAdded = wishlist.some((item) => item._id === _id);
  const { t, lang } = useLanguage();

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
                    <button
                      type="button"
                      className="product-details-lightbox-trigger"
                      onClick={() => openLightbox(activeImg)}
                      aria-label={lang === "tr" ? "Görseli büyüt" : "Open image lightbox"}
                    >
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
                    </button>
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
              <ProductDetailsPrice originalPrice={originalPrice} price={price} discount={discount} />
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
                  aria-pressed={isWishlistAdded}
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
      {lightbox.open && !!galleryImages.length && (
        <div
          className="product-details-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
        >
          <div className="product-details-lightbox__dialog" onClick={(e) => e.stopPropagation()}>
            <div className="product-details-lightbox__toolbar">
              <div className="product-details-lightbox__zoom-indicator">{Math.round(lightbox.zoom * 100)}%</div>
              <div className="product-details-lightbox__toolbar-actions">
                <button type="button" className="product-details-lightbox__btn" onClick={zoomOut} disabled={lightbox.zoom <= 1}>
                  -
                </button>
                <button type="button" className="product-details-lightbox__btn" onClick={zoomIn} disabled={lightbox.zoom >= 3}>
                  +
                </button>
                <button type="button" className="product-details-lightbox__btn" onClick={resetZoom}>
                  100%
                </button>
                <button type="button" className="product-details-lightbox__btn is-close" onClick={closeLightbox}>
                  ×
                </button>
              </div>
            </div>

            <div className="product-details-lightbox__stage">
              <div className="product-details-lightbox__image-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={galleryImages[lightbox.index]}
                  alt={lang === "tr" ? "Ürün görseli büyük görünüm" : "Product image full view"}
                  className="product-details-lightbox__image"
                  style={{ transform: `scale(${lightbox.zoom})` }}
                />
              </div>

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrevLightbox}
                    aria-label={lang === "tr" ? "Önceki görsel" : "Previous image"}
                    className="product-details-lightbox__nav product-details-lightbox__nav--prev"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={showNextLightbox}
                    aria-label={lang === "tr" ? "Sonraki görsel" : "Next image"}
                    className="product-details-lightbox__nav product-details-lightbox__nav--next"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="product-details-lightbox__thumbs">
                {galleryImages.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    className={`product-details-lightbox__thumb ${index === lightbox.index ? "is-active" : ""}`}
                    onClick={() => setLightboxIndex(index)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductDetailsArea;

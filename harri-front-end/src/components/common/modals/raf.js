import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// internal
import { Compare, CartTwo, Times, HeartTwo } from "@svg/index";
import SocialLinks from "@components/social";
import OldNewPrice from "@components/products/old-new-price";
import Quantity from "@components/products/quantity";
import ProductCategories from "@components/products/product-categories";
import ProductTags from "@components/products/product-tags";
import { RatingFull, RatingHalf } from "@components/products/rating";
import {
  add_cart_product,
  initialOrderQuantity,
} from "src/redux/features/cartSlice";
import Link from "next/link";
import { add_to_wishlist } from "src/redux/features/wishlist-slice";
import { useLanguage } from "src/context/LanguageContext";
import {
  buildCloudinaryImageUrl,
  PRODUCT_IMAGE_FALLBACK,
  buildImageErrorFallbackHandler,
  buildProductGalleryImages,
  isExternalMediaUrl,
} from "src/utils/media-url";
import ProductShareSheet from "@components/common/product-share-sheet";
import { formatCountBadge, getProductQtyInCart } from "src/utils/cart-ui";

const ProductModal = ({ product, list_modal = false }) => {
  const {
    _id,
    title,
    tags,
    SKU,
    price,
    discount,
    originalPrice,
    sku,
  } = product || {};

  const galleryImages = React.useMemo(() => buildProductGalleryImages(product), [product]);
  const [activeImg, setActiveImg] = useState(galleryImages[0] || "");
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const dispatch = useDispatch();

  const { t, lang } = useLanguage();
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart_products } = useSelector((state) => state.cart);
  const isWishlistAdded = wishlist.some((item) => item._id === _id);
  const cartQty = getProductQtyInCart(cart_products, _id);

  // handle add product
  const handleAddProduct = (prd) => {
    dispatch(add_cart_product(prd));
  };
  // initial Order Quantity
  // handle add wishlist
  const handleAddWishlist = (prd) => {
    dispatch(add_to_wishlist(prd));
  };

  useEffect(() => {
    setActiveImg(galleryImages[0] || "");
  }, [galleryImages]);

  const getImageIndex = React.useCallback((img) => {
    const index = galleryImages.findIndex((item) => item === img);
    return index >= 0 ? index : 0;
  }, [galleryImages]);

  const closeLightbox = React.useCallback(() => {
    setLightbox((prev) => ({ ...prev, open: false }));
  }, []);

  const openLightbox = React.useCallback((img) => {
    if (!galleryImages.length) return;
    setLightbox({
      open: true,
      index: getImageIndex(img || activeImg || galleryImages[0]),
    });
  }, [activeImg, galleryImages, getImageIndex]);

  const setLightboxIndex = React.useCallback((nextIndex) => {
    if (!galleryImages.length) return;
    const normalized = (nextIndex + galleryImages.length) % galleryImages.length;
    const nextImg = galleryImages[normalized];
    setActiveImg(nextImg);
    setLightbox((prev) => ({ ...prev, index: normalized }));
  }, [galleryImages]);

  const showPrevLightbox = React.useCallback(() => {
    setLightbox((prev) => {
      if (!galleryImages.length) return prev;
      const normalized = (prev.index - 1 + galleryImages.length) % galleryImages.length;
      setActiveImg(galleryImages[normalized]);
      return { ...prev, index: normalized };
    });
  }, [galleryImages]);

  const showNextLightbox = React.useCallback(() => {
    setLightbox((prev) => {
      if (!galleryImages.length) return prev;
      const normalized = (prev.index + 1) % galleryImages.length;
      setActiveImg(galleryImages[normalized]);
      return { ...prev, index: normalized };
    });
  }, [galleryImages]);

  useEffect(() => {
    if (!lightbox.open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        showPrevLightbox();
      } else if (event.key === "ArrowRight") {
        showNextLightbox();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeLightbox, lightbox.open, showNextLightbox, showPrevLightbox]);

  return (
    <div
      className="product__modal product__modal--smart modal fade"
      id={list_modal ? `productModal-list-${_id}` : `productModal-${_id}`}
      aria-labelledby={
        list_modal ? `productModal-list-${_id}` : `productModal-${_id}`
      }
      aria-hidden="true"
      tabIndex={"-1"}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="product__modal-wrapper">
            <div className="product__modal-close">
              <button
                className="product__modal-close-btn"
                type="button"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <Times />
              </button>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="product__modal-thumb-wrapper">
                  <div className="product__details-thumb-tab mr-40">
                    <div className="product__details-thumb-content w-img">
                      <div className="tab-content" id="nav-tabContent">
                        <div className="active-img">
                          <button
                            type="button"
                            className="product-details-lightbox-trigger"
                            onClick={() => openLightbox(activeImg)}
                            aria-label={lang === "tr" ? "Görseli büyüt" : "Open image lightbox"}
                          >
                            <Image
                              src={activeImg}
                              alt="image"
                              width={510}
                              height={485}
                              unoptimized={isExternalMediaUrl(activeImg)}
                              onError={buildImageErrorFallbackHandler(PRODUCT_IMAGE_FALLBACK)}
                              style={{ width: "100%", height: "100%" }}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="product__details-thumb-nav tp-tab">
                      <nav>
                        <div className="nav nav-tabs justify-content-sm-between">
                          {galleryImages.map((img, i) => (
                            <button
                              key={i}
                              className={`nav-link ${
                                img === activeImg ? "active" : ""
                              }`}
                              onClick={() => setActiveImg(img)}
                            >
                              <Image
                                src={img}
                                alt="image"
                                width={90}
                                height={90}
                                unoptimized={isExternalMediaUrl(img)}
                                onError={buildImageErrorFallbackHandler(PRODUCT_IMAGE_FALLBACK)}
                                style={{ width: "100%", height: "100%" }}
                              />
                            </button>
                          ))}
                        </div>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="product__details-wrapper">
                  <h3 className="product__details-title">
                    <Link
                      href={`/product-details/${_id}`}
                      data-bs-dismiss="modal"
                      aria-label={title}
                    >
                      {title}
                    </Link>
                  </h3>
                  {/* Price */}
                  <OldNewPrice
                    originalPrice={originalPrice}
                    discount={discount}
                    price={price}
                  />
                  {/* Price */}

                  {/* quantity */}
                  <Quantity />
                  {/* quantity */}
                  <div className="product__details-action product__details-action--smart d-flex flex-wrap align-items-center">
                    <button
                      onClick={() => handleAddProduct(product)}
                      type="button"
                      className="product-add-cart-btn product-add-cart-btn-3 product-add-cart-btn--primary"
                      aria-label={cartQty > 0 ? `${t('addToCart')} (${cartQty})` : t('addToCart')}
                      title={cartQty > 0 ? `${t('addToCart')} (${cartQty})` : t('addToCart')}
                    >
                      <CartTwo />
                      {t('addToCart')}
                      {cartQty > 0 && <span className="cart-btn-count">{formatCountBadge(cartQty)}</span>}
                    </button>
                    <div className="product__details-mini-actions">
                      {cartQty > 0 && (
                        <Link
                          href="/cart"
                          className="product-action-btn product-action-btn--go-cart"
                          aria-label={t('viewCart')}
                        >
                          <span className="product-action-btn__icon" aria-hidden="true">
                            <i className="fa-regular fa-circle-check"></i>
                          </span>
                          <span>{t('viewCart')}</span>
                        </Link>
                      )}
                      <button
                        onClick={() => handleAddWishlist(product)}
                        type="button"
                        className={`product-action-btn product-action-btn--compact ${
                          isWishlistAdded ? "active" : ""
                        }`}
                      >
                        <HeartTwo />
                        <span className="product-action-tooltip">
                          {t('addToWishlist')}
                        </span>
                      </button>
                      <ProductShareSheet productId={_id} title={title} className="product-action-btn product-action-btn--compact" />
                    </div>
                  </div>
                  <div className="product__details-sku product__details-more">
                    <p>{t('sku')}:</p>
                    <span>{sku}</span>
                  </div>
                  {/* Product Categories */}
                  <ProductCategories />
                  {/* Product Categories */}

                  {/* Tags */}
                  <ProductTags tag={tags} />
                  {/* Tags */}
                  <div className="product__details-share">
                    <span>{t('share')}:</span>
                    <SocialLinks />
                  </div>
                </div>
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
            <div className="product-details-lightbox__stage">
              <button
                type="button"
                className="product-details-lightbox__close"
                onClick={closeLightbox}
                aria-label={lang === "tr" ? "Kapat" : "Close"}
              >
                ×
              </button>

              <div className="product-details-lightbox__image-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    buildCloudinaryImageUrl(galleryImages[lightbox.index], {
                      width: 2000,
                      height: 2000,
                      fit: "limit",
                      quality: "auto:best",
                      format: "auto",
                      dpr: "auto",
                      sharpen: true,
                    }) || galleryImages[lightbox.index]
                  }
                  alt={lang === "tr" ? "Ürün görseli büyük görünüm" : "Product image full view"}
                  className="product-details-lightbox__image"
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
                    <img
                      src={
                        buildCloudinaryImageUrl(img, {
                          width: 180,
                          height: 180,
                          fit: "fill",
                          quality: "auto:good",
                          format: "auto",
                        }) || img
                      }
                      alt=""
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductModal;

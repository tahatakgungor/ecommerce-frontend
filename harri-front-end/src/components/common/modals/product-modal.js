'use client'
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// internal
import { Compare, CartTwo, Times, HeartTwo } from "@svg/index";
import SocialLinks from "@components/social";
import OldNewPrice from "@components/products/old-new-price";
import Quantity from "@components/products/quantity";
import ProductCategories from "@components/products/product-categories";
import ProductTags from "@components/products/product-tags";
import ProductRatingSummary from "@components/products/product-rating-summary";
import ProductShareSheet from "@components/common/product-share-sheet";
import { add_cart_product, initialOrderQuantity } from "src/redux/features/cartSlice";
import Link from "next/link";
import { add_to_wishlist } from "src/redux/features/wishlist-slice";
import { Modal } from "react-bootstrap";
import { handleModalShow } from "src/redux/features/productSlice";
import { useLanguage } from "src/context/LanguageContext";
import {
  PRODUCT_IMAGE_FALLBACK,
  buildImageErrorFallbackHandler,
  buildProductGalleryImages,
  isExternalMediaUrl,
} from "src/utils/media-url";
import { getProductQtyInCart } from "src/utils/cart-ui";

const ProductModal = () => {
  const { product, isShow } = useSelector((state) => state.product);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart_products } = useSelector((state) => state.cart);
  const { _id, title, tags, SKU, price, discount, originalPrice, sku } = product || {};
  const galleryImages = useMemo(() => buildProductGalleryImages(product), [product]);
  const [activeImg, setActiveImg] = useState(galleryImages[0] || "");
  const dispatch = useDispatch();
  const isWishlistAdded = wishlist.some((item) => item._id === _id);
  const cartQty = getProductQtyInCart(cart_products, _id);
  const isAddedToCart = cartQty > 0;
  const { t } = useLanguage();

  useEffect(() => {
    setActiveImg(galleryImages[0] || "");
  }, [galleryImages]);

  if(!product) return null;

  // handle add product
  const handleAddProduct = (prd) => {
    dispatch(add_cart_product(prd));
  };
  // initial Order Quantity
  // handle add wishlist
  const handleAddWishlist = (prd) => {
    dispatch(add_to_wishlist(prd));
  };
  // handle modal close 
  const handleModalClose = () => {
    dispatch(handleModalShow())
    dispatch(initialOrderQuantity())
  }


  return (
    <Modal
      show={isShow}
      onHide={handleModalClose}
      className="product__modal"
      centered={true}
    >
      <div className="product__modal-wrapper">
        <div className="product__modal-close">
          <button
            className="product__modal-close-btn"
            type="button"
            onClick={() => handleModalClose()}
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
                      {activeImg ? (
                        <Image
                          priority
                          src={activeImg}
                          alt="image"
                          width={510}
                          height={485}
                          unoptimized={isExternalMediaUrl(activeImg)}
                          onError={buildImageErrorFallbackHandler(PRODUCT_IMAGE_FALLBACK)}
                          sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 510px"
                          style={{ width: "100%", height: "auto", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: "100%", aspectRatio: "1/1", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ color: "#9ca3af" }}>{t('noImage') || 'Resim Yok'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="product__details-thumb-nav tp-tab">
                  <nav>
                    <div className="nav nav-tabs justify-content-sm-between">
                      {galleryImages.map((img, i) => (
                        <button
                          key={i}
                          className={`nav-link ${img === activeImg ? "active" : ""
                            }`}
                          onClick={() => setActiveImg(img)}
                        >
                          <Image
                            priority
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
              <h3 className="product__details-title">{title}</h3>
              <ProductRatingSummary productId={_id} className="tp-rating-summary--details mb-12" />
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
              <div className="product__details-action d-flex flex-wrap align-items-center">
                <button
                  onClick={() => handleAddProduct(product)}
                  type="button"
                  className="product-add-cart-btn product-add-cart-btn-3"
                  aria-label={isAddedToCart ? `${t('addToCart')} (${cartQty})` : t('addToCart')}
                  title={isAddedToCart ? `${t('addToCart')} (${cartQty})` : t('addToCart')}
                >
                  <CartTwo />
                  {t('addToCart')}
                  {isAddedToCart && <span className="cart-btn-count">{cartQty}</span>}
                </button>
                {isAddedToCart && (
                  <Link href="/cart" className="product-action-btn" onClick={handleModalClose} aria-label={t('viewCart')}>
                    <CartTwo />
                  </Link>
                )}
                <button
                  onClick={() => handleAddWishlist(product)}
                  type="button"
                  className={`product-action-btn ${isWishlistAdded ? "active" : ""
                    }`}
                  aria-pressed={isWishlistAdded}
                >
                  <HeartTwo />
                  <span className="product-action-tooltip">
                    {t('addToWishlist')}
                  </span>
                </button>
                <ProductShareSheet productId={_id} title={title} />
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
    </Modal>
  );
};

export default ProductModal;

'use client';
import React from "react";
// internal
import ProductLoader from "@components/loader/product-loader";
import SingleProduct from "@components/products/single-product";
import { useGetShowingProductsQuery } from "src/redux/features/productApi";
import { useLanguage } from "src/context/LanguageContext";

const OfferPopularProduct = () => {
  const { t } = useLanguage();
  const { data: products, isError, isLoading } = useGetShowingProductsQuery();

  if (isLoading) {
    return (
      <section className="product__coupon-area porduct__offer pt-120 pb-60">
        <div className="container">
          <ProductLoader loading={true} />
        </div>
      </section>
    );
  }

  if (isError || !products?.products?.length) return null;

  // Sadece indirimli ürünleri al, en fazla 4 tane göster
  const discountedProducts = products.products
    .filter((p) => p.discount > 0)
    .slice(0, 4);

  if (!discountedProducts.length) return null;

  return (
    <section className="product__coupon-area porduct__offer pt-80 pb-20">
      <div className="container">
        <div className="row align-items-end mb-35">
          <div className="col-12">
            <div className="section__title-wrapper-13">
              <h3 className="section__title-13">{t('dealOfTheDay')}</h3>
            </div>
          </div>
        </div>
        <div className="row">
          {discountedProducts.map((product) => (
            <div key={product._id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6">
              <SingleProduct product={product} discountPrd={true} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OfferPopularProduct;

'use client';
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import ProductLoader from "@components/loader/product-loader";
import ErrorMessage from "@components/error-message/error";
import SingleProduct from "@components/products/single-product";
import { useGetShowingProductsQuery } from "src/redux/features/productApi";
import { useLanguage } from "src/context/LanguageContext";

const CartRelatedProducts = () => {
  const { t } = useLanguage();
  const { cart_products } = useSelector((state) => state.cart);
  const { data, isLoading, isError } = useGetShowingProductsQuery();

  const recommendations = useMemo(() => {
    const catalog = Array.isArray(data?.products) ? data.products : [];
    const cartIds = new Set((Array.isArray(cart_products) ? cart_products : []).map((item) => item?._id).filter(Boolean));
    const cartCategories = new Set(
      (Array.isArray(cart_products) ? cart_products : [])
        .map((item) => item?.category?.name)
        .filter(Boolean)
        .map((value) => String(value).trim().toLowerCase())
    );

    const primary = catalog.filter((product) => {
      const productId = product?._id;
      if (!productId || cartIds.has(productId)) return false;
      const category = String(product?.category?.name || "").trim().toLowerCase();
      return category && cartCategories.has(category);
    });

    if (primary.length > 0) {
      return primary.slice(0, 8);
    }

    return catalog.filter((product) => !cartIds.has(product?._id)).slice(0, 8);
  }, [data, cart_products]);

  if (isLoading) {
    return (
      <section className="product__related-area pt-40 pb-20">
        <div className="container">
          <ProductLoader loading />
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="product__related-area pt-40 pb-20">
        <div className="container">
          <ErrorMessage message="There was an error!" />
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="product__related-area pt-40 pb-20">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="section__title-wrapper-13 mb-25">
              <h3 className="section__title-13">{t("relatedProducts")}</h3>
            </div>
          </div>
        </div>
        <div className="product__related-slider">
          <div className="row flex-nowrap gx-3" style={{ overflowX: "auto", overflowY: "hidden" }}>
            {recommendations.map((product) => (
              <div key={product._id} className="col-lg-3 col-md-4 col-sm-6 flex-shrink-0">
                <SingleProduct product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartRelatedProducts;

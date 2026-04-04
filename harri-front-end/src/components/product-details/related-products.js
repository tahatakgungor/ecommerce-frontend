'use client';
import React, { useMemo } from "react";
// internal
import Loader from "@components/loader/loader";
import ErrorMessage from "@components/error-message/error";
import { useGetRelatedProductsQuery, useGetShowingProductsQuery } from "src/redux/features/productApi";
import SingleProduct from "@components/products/single-product";
import { useLanguage } from "src/context/LanguageContext";


const RelatedProducts = ({ id, tags, categoryName }) => {
  const { t } = useLanguage();
  const {
    data,
    isLoading,
    isError,
  } = useGetRelatedProductsQuery({ id, tags });
  const {
    data: showingData,
    isLoading: isShowingLoading,
    isError: isShowingError,
  } = useGetShowingProductsQuery();

  const relatedProducts = useMemo(() => {
    const primary = Array.isArray(data?.products) ? data.products : (Array.isArray(data?.product) ? data.product : []);
    const filteredPrimary = primary.filter((product) => product?._id !== id);
    if (filteredPrimary.length > 0) {
      return filteredPrimary.slice(0, 8);
    }

    const catalog = Array.isArray(showingData?.products) ? showingData.products : [];
    const normalizedCurrentCategory = String(categoryName || "").trim().toLowerCase();
    const normalizedTagSet = new Set(
      (Array.isArray(tags) ? tags : [])
        .map((tag) => String(tag || "").trim().toLowerCase())
        .filter(Boolean)
    );

    const scoreProduct = (product) => {
      let score = 0;
      const productCategory = String(product?.category?.name || "").trim().toLowerCase();
      if (normalizedCurrentCategory && productCategory === normalizedCurrentCategory) {
        score += 3;
      }

      const productTags = Array.isArray(product?.tags) ? product.tags : [];
      for (const tag of productTags) {
        if (normalizedTagSet.has(String(tag || "").trim().toLowerCase())) {
          score += 1;
        }
      }

      return score;
    };

    return catalog
      .filter((product) => product?._id !== id)
      .map((product) => ({ product, score: scoreProduct(product) }))
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product)
      .slice(0, 8);
  }, [data, showingData, id, tags, categoryName]);


  let content = null;

  if (isLoading && relatedProducts.length === 0) {
    content = (
      <>
        <Loader loading={isLoading} />
      </>
    );
  }

  if (!isLoading && !isShowingLoading && isError && isShowingError && relatedProducts.length === 0) {
    content = <ErrorMessage message="There was an error!" />;
  }

  if (!isLoading && !isShowingLoading && relatedProducts.length === 0) {
    content = <ErrorMessage message={t("noRelatedProducts") || "Benzer ürün bulunamadı"} />;
  }

  if (relatedProducts.length > 0) {
    content = relatedProducts.map((product) => (
      <div key={product._id} className="col-lg-3 col-md-4 col-sm-6 flex-shrink-0">
        <SingleProduct product={product} />
      </div>
    ));
  }

  return (
    <React.Fragment>
      <section className="product__related-area pb-80">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="section__title-wrapper-13 mb-35">
                <h3 className="section__title-13">{t('relatedProducts')}</h3>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-12">
              <div className="product__related-slider">
                <div
                  className="row flex-nowrap gx-3"
                  style={{ overflowX: "auto", overflowY: "hidden" }}
                >
                  {content}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default RelatedProducts;

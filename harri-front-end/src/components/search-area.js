'use client';
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// internal
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import NiceSelect from "@ui/NiceSelect";
import ErrorMessage from "@components/error-message/error";
import SingleProduct from "@components/products/single-product";
import ProductLoader from "@components/loader/product-loader";
import EmptyCart from "@components/common/sidebar/cart-sidebar/empty-cart";
import { useGetShowingProductsQuery } from "src/redux/features/productApi";
import BreadcrumbTwo from "@components/common/breadcrumb/breadcrumb-2";
import { useLanguage } from "src/context/LanguageContext";
import Pagination from "@ui/Pagination";
import {
  buildCatalogQueryParams,
  getCatalogSortFromSelect,
  getSortValueForSelect,
  normalizeCatalogSort,
} from "src/utils/catalog-query";

export default function SearchAreaMain({ searchText, page, sort }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang } = useLanguage();
  const currentPage = Math.max(1, Number(page) || 1);
  const currentSort = normalizeCatalogSort(sort);
  const catalogParams = useMemo(
    () =>
      buildCatalogQueryParams({
        q: searchText,
        sort: currentSort,
        page: currentPage,
        size: 8,
        includeFacets: false,
      }),
    [currentPage, currentSort, searchText]
  );
  const { data: products, isError, isLoading } = useGetShowingProductsQuery(catalogParams, {
    skip: !String(searchText || "").trim(),
  });

  // selectShortHandler
  const shortHandler = (e) => {
    const nextSort = getCatalogSortFromSelect(e.value);
    const nextParams = new URLSearchParams(searchParams.toString());
    if (nextSort === "latest") {
      nextParams.delete("sort");
    } else {
      nextParams.set("sort", nextSort);
    }
    nextParams.delete("page");
    router.push(`/search?${nextParams.toString()}`);
  };

  const sortOptions = lang === "tr"
    ? [
        { value: "Short By Price", text: "Fiyata Göre Sırala" },
        { value: "Price low to high", text: "Fiyat: Düşükten Yükseğe" },
        { value: "Price high to low", text: "Fiyat: Yüksekten Düşüğe" },
      ]
    : [
        { value: "Short By Price", text: "Sort By Price" },
        { value: "Price low to high", text: "Price low to high" },
        { value: "Price high to low", text: "Price high to low" },
      ];

  // decide what to render
  let content = null;
  if (isLoading) {
    content = <ProductLoader loading={isLoading} />;
  }

  if (!isLoading && isError) {
    content = <ErrorMessage message={t("somethingWentWrong")} />;
  }

  if (!isLoading && !isError && products?.products?.length === 0) {
    content = <ErrorMessage message={t("noResults")} />;
  }

  if (!isLoading && !isError && products?.products?.length > 0) {
    const product_items = products.products;
    if (product_items.length === 0) {
      content = (
        <div className="pb-100">
          <EmptyCart search_prd={true} />
        </div>
      );
    } else {
      content = (
        <section className="shop__area pb-60 pt-100">
          <div className="container">
            <div className="shop__top mb-50">
              <div className="row align-items-center">
                <div className="col-lg-6 col-md-5">
                  <div className="shop__result">
                    <p>{t('total') || 'Total'} {products.total} {t('itemsFound')}</p>
                  </div>
                </div>
                <div className="col-lg-6 col-md-7">
                  <div className="shop__control-bar d-flex flex-wrap justify-content-md-end align-items-center">
                    <div className="shop__sort-item">
                      <div className="shop__sort-select">
                        <NiceSelect
                          options={sortOptions}
                          currentValue={getSortValueForSelect(currentSort)}
                          defaultCurrent={sortOptions.findIndex((item) => item.value === getSortValueForSelect(currentSort))}
                          onChange={shortHandler}
                          name="Short By Price"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="shop__main">
              <div className="row">
                {product_items?.map((product) => (
                  <div
                    key={product._id}
                    className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6"
                  >
                    <SingleProduct product={product} />
                  </div>
                ))}
              </div>
            </div>
            {products.totalPages > 1 && (
              <div className="row">
                <div className="col-xxl-12">
                  <div className="tp-pagination tp-pagination-style-2">
                    <Pagination
                      handlePageClick={(event) => {
                        const nextPage = (event?.selected ?? 0) + 1;
                        const nextParams = new URLSearchParams(searchParams.toString());
                        if (nextPage <= 1) {
                          nextParams.delete("page");
                        } else {
                          nextParams.set("page", String(nextPage));
                        }
                        router.push(`/search?${nextParams.toString()}`);
                      }}
                      focusPage={Math.max(0, currentPage - 1)}
                      pageCount={products.totalPages}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      );
    }
  }

  return (
    <Wrapper>
      <Header style_2={true}/>
      <BreadcrumbTwo title={t('searchResult')} />
      {content}
      <Footer />
    </Wrapper>
  );
}

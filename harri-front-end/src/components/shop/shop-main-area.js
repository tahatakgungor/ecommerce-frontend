'use client';
import { useState } from "react";
// internal
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import ShopBreadcrumb from "@components/common/breadcrumb/shop-breadcrumb";
import ShopArea from "@components/shop/shop-area";
import ErrorMessage from "@components/error-message/error";
import { useGetShowingProductsQuery } from "src/redux/features/productApi";
import { useGetCategoriesQuery } from "src/redux/features/categoryApi";
import ShopLoader from "@components/loader/shop-loader";
import { applyShopFilters, buildShopRoute, toFilterSlug } from "src/utils/shop-filters";
import { useLanguage } from "src/context/LanguageContext";

function toBreadcrumbFallback(rawCategory) {
  if (!rawCategory) return "";
  const decoded = decodeURIComponent(String(rawCategory || ""));
  if (decoded.includes(" ")) return decoded;
  return decoded
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function resolveCategoryTrail({ childParam, parentParam, categoryItems }) {
  const childSlug = toFilterSlug(childParam);
  const parentSlug = toFilterSlug(parentParam);

  const buildParentHref = (slug) => buildShopRoute("", { Category: slug, category: null });
  const buildChildHref = (pSlug, cSlug) => buildShopRoute("", { Category: pSlug, category: cSlug });

  if (Array.isArray(categoryItems) && categoryItems.length > 0) {
    if (parentSlug) {
      const matchedParent = categoryItems.find((item) => toFilterSlug(item?.parent) === parentSlug);
      if (matchedParent) {
        if (childSlug) {
          const matchedChild = matchedParent.children?.find((child) => toFilterSlug(child) === childSlug);
          if (matchedChild) {
            return [
              { label: matchedParent.parent, href: buildParentHref(parentSlug) },
              { label: matchedChild, href: buildChildHref(parentSlug, childSlug) },
            ];
          }
        }
        return [{ label: matchedParent.parent, href: buildParentHref(parentSlug) }];
      }
    }

    if (childSlug) {
      for (const item of categoryItems) {
        const matchedChild = item?.children?.find((child) => toFilterSlug(child) === childSlug);
        if (matchedChild) {
          const resolvedParentSlug = toFilterSlug(item.parent);
          return [
            { label: item.parent, href: buildParentHref(resolvedParentSlug) },
            { label: matchedChild, href: buildChildHref(resolvedParentSlug, childSlug) },
          ];
        }
      }
    }
  }

  if (parentParam && childParam) {
    const fallbackParentSlug = toFilterSlug(parentParam);
    const fallbackChildSlug = toFilterSlug(childParam);
    return [
      { label: toBreadcrumbFallback(parentParam), href: buildParentHref(fallbackParentSlug) },
      { label: toBreadcrumbFallback(childParam), href: buildChildHref(fallbackParentSlug, fallbackChildSlug) },
    ];
  }

  if (parentParam) {
    const fallbackParentSlug = toFilterSlug(parentParam);
    return [{ label: toBreadcrumbFallback(parentParam), href: buildParentHref(fallbackParentSlug) }];
  }

  if (childParam) {
    return [{ label: toBreadcrumbFallback(childParam) }];
  }

  return [];
}

export default function ShopMainArea({ Category, category, brand, priceMin, max, priceMax }) {
  const { data: products, isError, isLoading } = useGetShowingProductsQuery();
  const { data: categoriesData } = useGetCategoriesQuery();
  const [shortValue,setShortValue] = useState("");
  const { t } = useLanguage();

  // selectShortHandler
  const selectShortHandler = (e) => {
    setShortValue(e.value);
  };

  // decide what to render
  let content = null;
  if (isLoading) {
    content = <ShopLoader loading={isLoading} />;
  }

  if (!isLoading && isError) {
    content = <ErrorMessage message={t("somethingWentWrong")} />;
  }

  if (!isLoading && !isError && products?.products?.length === 0) {
    content = <ErrorMessage message={t("noResults")} />;
  }

  if (!isLoading && !isError && products?.products?.length > 0) {
    let all_products = products.products;
    const product_items = applyShopFilters(all_products, {
      Category,
      category,
      brand,
      priceMin,
      max,
      priceMax,
      shortValue,
    });


    content = (
      <ShopArea
        products={product_items}
        all_products={all_products}
        shortHandler={selectShortHandler}
      />
    );
  }

  return (
    <Wrapper>
      <Header style_2={true} />
      <ShopBreadcrumb
        categoryTrail={resolveCategoryTrail({
          childParam: category,
          parentParam: Category,
          categoryItems: categoriesData?.categories,
        })}
      />
      {content}
      <Footer />
    </Wrapper>
  );
}

'use client';
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  buildShopRoute,
  toFilterSlug,
} from "src/utils/shop-filters";
import { useLanguage } from "src/context/LanguageContext";
import {
  buildCatalogQueryParams,
  getCatalogSortFromSelect,
  getSortValueForSelect,
  normalizeCatalogSort,
} from "src/utils/catalog-query";

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

export default function ShopMainArea({ Category, category, brand, priceMin, max, priceMax, page, sort }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categoriesData } = useGetCategoriesQuery();
  const { t } = useLanguage();
  const categoryItems = useMemo(() => categoriesData?.categories ?? [], [categoriesData?.categories]);
  const currentPage = Math.max(1, Number(page) || 1);
  const currentSort = normalizeCatalogSort(sort);
  const shouldWaitForCategoryScope = Boolean(Category) && !categoriesData?.categories;
  const catalogParams = useMemo(
    () =>
      buildCatalogQueryParams({
        Category,
        category,
        brand,
        priceMin,
        max,
        priceMax,
        sort: currentSort,
        page: currentPage,
        size: 9,
        includeFacets: true,
        categoryItems,
      }),
    [Category, brand, category, categoryItems, currentPage, currentSort, max, priceMax, priceMin]
  );
  const { data: catalogData, isError, isLoading } = useGetShowingProductsQuery(catalogParams, {
    skip: shouldWaitForCategoryScope,
  });

  const selectShortHandler = (e) => {
    const nextSort = getCatalogSortFromSelect(e.value);
    router.push(
      buildShopRoute(searchParams, {
        sort: nextSort === "latest" ? null : nextSort,
        page: null,
      })
    );
  };

  // decide what to render
  let content = null;
  if (isLoading || shouldWaitForCategoryScope) {
    content = <ShopLoader loading={isLoading} />;
  }

  if (!isLoading && isError) {
    content = <ErrorMessage message={t("somethingWentWrong")} />;
  }

  if (!isLoading && !isError && catalogData) {
    content = (
      <ShopArea
        products={catalogData.products || []}
        total={catalogData.total || 0}
        currentPage={catalogData.page || currentPage}
        totalPages={catalogData.totalPages || 0}
        pageSize={catalogData.size || 9}
        sortValue={getSortValueForSelect(currentSort)}
        brandOptions={catalogData.facets?.brands || []}
        priceBounds={catalogData.priceBounds || { min: 0, max: 0 }}
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

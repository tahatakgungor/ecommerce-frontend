'use client';
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Scrollbar } from "swiper";
// internal
import SingleCategory from "./single-category";
import ErrorMessage from "@components/error-message/error";
import CategoryLoader from "@components/loader/category-loader";
import { useGetCategoriesQuery } from "src/redux/features/categoryApi";
import { toFilterSlug } from "src/utils/shop-filters";
import { useLanguage } from "src/context/LanguageContext";

const ShopCategoryArea = () => {
  const [ready, setReady] = useState(false);
  const { t } = useLanguage();
  useEffect(() => setReady(true), []);
  const { data: categories, isLoading, isError } = useGetCategoriesQuery();
  // decide what to render
  let content = null;
  let cardCount = 0;

  if (isLoading) {
    content = (
      <CategoryLoader loading={isLoading} />
    );
  }

  if (!isLoading && isError) {
    content = <ErrorMessage message={t("somethingWentWrong")} />;
  }

  if (!isLoading && !isError && categories?.categories?.length === 0) {
    content = <ErrorMessage message={t("noResults")} />;
  }

  if (!isLoading && !isError && categories?.categories?.length > 0) {
    const uniqueCards = [];
    const seen = new Set();

    for (const parentCategory of categories.categories) {
      const parentName = parentCategory?.parent || parentCategory?.name;
      if (!parentName) continue;

      const parentKey = `parent:${toFilterSlug(parentName)}`;
      if (!seen.has(parentKey)) {
        uniqueCards.push({
          key: parentKey,
          label: parentName,
          subtitle: "Ana Kategori",
          href: `/shop?Category=${toFilterSlug(parentName)}`,
          level: "parent",
        });
        seen.add(parentKey);
      }

      const children = Array.isArray(parentCategory?.children) ? parentCategory.children : [];
      for (const childName of children) {
        if (!childName) continue;
        const childKey = `child:${toFilterSlug(parentName)}:${toFilterSlug(childName)}`;
        if (seen.has(childKey)) continue;
        uniqueCards.push({
          key: childKey,
          label: childName,
          subtitle: parentName,
          href: `/shop?category=${toFilterSlug(childName)}`,
          level: "child",
        });
        seen.add(childKey);
      }
    }

    cardCount = uniqueCards.length;
    content = uniqueCards.map((item) => (
      <SwiperSlide key={item.key}>
        <SingleCategory item={item} />
      </SwiperSlide>
    ));
  }
  return (
    <section className="product__category pt-100 pb-100">
      <div className="container">
        <div className="row">
          <div className="col-xxl-12">
            <div className="product__category-slider">
              <Swiper
                className="product__category-slider-active swiper-container"
                slidesPerView={4}
                spaceBetween={30}
                loop={ready && cardCount > 6}
                modules={[Scrollbar]}
                scrollbar={{
                  el: ".tp-scrollbar",
                  clickable: true,
                }}
                breakpoints={{
                  1601: {
                    slidesPerView: 4,
                  },
                  1400: {
                    slidesPerView: 4,
                  },
                  1200: {
                    slidesPerView: 4,
                  },
                  992: {
                    slidesPerView: 3,
                  },
                  768: {
                    slidesPerView: 2,
                  },
                  576: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                  },
                  0: {
                    slidesPerView: 1,
                    spaceBetween: 0,
                  },
                }}
              >
                {content}
              </Swiper>
              {cardCount > 4 && <div className="tp-scrollbar"></div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopCategoryArea;

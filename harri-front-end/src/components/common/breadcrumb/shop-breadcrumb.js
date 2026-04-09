'use client';
import React from "react";
import Link from "next/link";
import { Home } from "@svg/index";
import { useLanguage } from "src/context/LanguageContext";

const ShopBreadcrumb = ({ categoryLabel }) => {
  const { t } = useLanguage();
  return (
    <section className="breadcrumb__area breadcrumb__style-9 pt-13 pb-55 include-bg">
      <div className="container">
        <div className="row">
          <div className="col-xxl-7">
            <div className="breadcrumb__content p-relative z-index-1">
              <div className="breadcrumb__list has-icon">
                <span className="breadcrumb-icon">
                  <Home />
                </span>
                <span>
                  <Link href="/">{t('home')}</Link>
                </span>
                <span className="dvdr">
                  <i className="fa-regular fa-angle-right"></i>
                </span>
                <span>
                  <Link href="/shop">{t('shop')}</Link>
                </span>
                {categoryLabel ? (
                  <>
                    <span className="dvdr">
                      <i className="fa-regular fa-angle-right"></i>
                    </span>
                    <span>{categoryLabel}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopBreadcrumb;

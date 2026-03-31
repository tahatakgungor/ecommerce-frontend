'use client';
import React from "react";
import Link from "next/link";
import Home from "@svg/home";
import { useLanguage } from "src/context/LanguageContext";

const ProductDetailsBreadcrumb = ({title}) => {
  const { t } = useLanguage();
  return (
    <section className="breadcrumb__area breadcrumb__style-9 pt-75 include-bg">
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
                  <a href="#">{t('products')}</a>
                </span>
                <span className="dvdr">
                  <i className="fa-regular fa-angle-right"></i>
                </span>
                <span>{title}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsBreadcrumb;

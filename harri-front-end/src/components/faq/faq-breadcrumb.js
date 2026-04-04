'use client';

import Link from "next/link";
import { useLanguage } from "src/context/LanguageContext";
import { sitePagesContent } from "src/data/site-pages-content";

const FaqBreadcrumb = () => {
  const { lang, t } = useLanguage();
  const faqContent = sitePagesContent[lang]?.faq || sitePagesContent.tr.faq;

  return (
    <section className="breadcrumb__area breadcrumb__style-8 p-relative include-bg pt-110 pb-50">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xxl-8 col-xl-8 col-lg-10">
            <div className="breadcrumb__content text-center p-relative z-index-1">
              <h3 className="breadcrumb__title">{faqContent.heroTitle}</h3>
              <div className="breadcrumb__list">
                <span>
                  <Link href="/">{t('home')}</Link>
                </span>
                <span className="dvdr">
                  <i className="fa-solid fa-circle-small"></i>
                </span>
                <span>{faqContent.heroBreadcrumb}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqBreadcrumb;

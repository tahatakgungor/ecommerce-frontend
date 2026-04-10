'use client';

import SitePageHero from "@components/common/breadcrumb/site-page-hero";
import { useLanguage } from "src/context/LanguageContext";
import { sitePagesContent } from "src/data/site-pages-content";

const FaqBreadcrumb = () => {
  const { lang, t } = useLanguage();
  const faqContent = sitePagesContent[lang]?.faq || sitePagesContent.tr.faq;

  return (
    <SitePageHero
      title={faqContent.heroTitle}
      breadcrumbLabel={faqContent.heroBreadcrumb || t("faqs")}
    />
  );
};

export default FaqBreadcrumb;

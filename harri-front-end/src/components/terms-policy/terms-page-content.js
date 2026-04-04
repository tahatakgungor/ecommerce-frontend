'use client';

import SectionTop from "@components/terms-policy/section-top-bar";
import TermsArea from "@components/terms-policy/terms-area";
import { useLanguage } from "src/context/LanguageContext";
import { sitePagesContent } from "src/data/site-pages-content";

const TermsPageContent = () => {
  const { lang } = useLanguage();
  const terms = sitePagesContent[lang]?.terms || sitePagesContent.tr.terms;

  return (
    <>
      <SectionTop title={terms.title} subtitle={terms.subtitle} />
      <TermsArea />
    </>
  );
};

export default TermsPageContent;

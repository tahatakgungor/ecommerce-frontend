'use client';

import SectionTop from "@components/terms-policy/section-top-bar";
import PolicyArea from "@components/terms-policy/policy-area";
import { useLanguage } from "src/context/LanguageContext";
import { sitePagesContent } from "src/data/site-pages-content";

const PolicyPageContent = () => {
  const { lang } = useLanguage();
  const policy = sitePagesContent[lang]?.policy || sitePagesContent.tr.policy;

  return (
    <>
      <SectionTop title={policy.title} subtitle={policy.subtitle} />
      <PolicyArea />
    </>
  );
};

export default PolicyPageContent;

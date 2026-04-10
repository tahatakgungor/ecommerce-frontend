'use client';
import BoxItems from "./box-items";
import FormArea from "./form-area";
import LocationArea from "./location-area";
import SitePageHero from "@components/common/breadcrumb/site-page-hero";
import { useLanguage } from "src/context/LanguageContext";

const ContactArea = () => {
  const { t } = useLanguage();
  return (
    <>
      <SitePageHero title={t("contactUs")} breadcrumbLabel={t("contactUs")} />
      <BoxItems/>
      <FormArea/>
      <LocationArea/>
    </>
  );
};

export default ContactArea;

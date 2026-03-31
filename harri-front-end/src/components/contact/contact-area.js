'use client';
import BoxItems from "./box-items";
import FormArea from "./form-area";
import LocationArea from "./location-area";
import TopBar from "./top-bar";
import { useLanguage } from "src/context/LanguageContext";

const ContactArea = () => {
  const { t } = useLanguage();
  return (
    <>
      <TopBar
        title={t('getToKnowUs')}
        subtitle={t('contactSubtitle')}
      />
      <BoxItems/>
      <FormArea/>
      <LocationArea/>
    </>
  );
};

export default ContactArea;

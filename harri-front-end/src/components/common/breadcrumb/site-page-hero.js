'use client';

import Link from "next/link";
import { useLanguage } from "src/context/LanguageContext";

const SitePageHero = ({ title, breadcrumbLabel, description = "" }) => {
  const { t } = useLanguage();

  return (
    <section className="site-page-hero serravit-topbar-neutral">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xxl-9 col-xl-10 col-lg-11">
            <div className="site-page-hero__content text-center">
              <h1 className="site-page-hero__title">{title}</h1>
              {description ? <p className="site-page-hero__desc">{description}</p> : null}
              <div className="site-page-hero__crumb">
                <span>
                  <Link href="/">{t("home")}</Link>
                </span>
                <span className="dvdr">
                  <i className="fa-solid fa-circle-small"></i>
                </span>
                <span>{breadcrumbLabel || title}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SitePageHero;


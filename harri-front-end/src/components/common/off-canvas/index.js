'use client';
import React from "react";
import Image from "next/image";
import Link from "next/link";
// internal
import shape from "@assets/img/shape/offcanvas-shape-1.png";
import logo from "@assets/img/logo/logo-black.svg";
import MobileMenus from "./mobile-menus";
import SocialLinks from "@components/social";
import { useLanguage } from "src/context/LanguageContext";
import SearchForm from "@components/forms/search-form";
import { useGetSiteSettingsQuery } from "src/redux/features/siteSettingsApi";
const OffCanvas = ({ isOffCanvasOpen, setIsOffCanvasOpen }) => {
  const { t, lang, toggleLang } = useLanguage();
  const { data: siteSettings } = useGetSiteSettingsQuery();
  const announcementText = lang === "tr"
    ? siteSettings?.announcementTextTr
    : (siteSettings?.announcementTextEn || siteSettings?.announcementTextTr);
  const showAnnouncement = Boolean(siteSettings?.announcementActive && announcementText);
  const supportPhone = siteSettings?.supportPhone || "0 262 581 55 15";
  const supportEmail = siteSettings?.supportEmail || "info@serravit.com.tr";

  return (
    <React.Fragment>
      <div
        className={`offcanvas__area offcanvas__area-1 ${
          isOffCanvasOpen ? "offcanvas-opened" : ""
        } ${showAnnouncement ? "offcanvas__area--announcement-safe" : ""}`}
      >
        <div className="offcanvas__wrapper">
          <div className="offcanvas__shape">
            <Image className="offcanvas__shape-1" src={shape} alt="shape" />
          </div>
          <div className="offcanvas__close">
            <button
              onClick={() => setIsOffCanvasOpen(false)}
              className="offcanvas__close-btn offcanvas-close-btn"
              aria-label="Menüyü kapat"
            >
              <i className="fa-regular fa-xmark"></i>
            </button>
          </div>
          <div className="offcanvas__content">
            <div className="offcanvas__top mb-30">
              <div className="offcanvas__logo logo">
                <Link href="/" onClick={() => setIsOffCanvasOpen(false)}>
                  <Image src={logo} alt="logo" />
                </Link>
              </div>
            </div>

            {/* Search */}
            <div className="mobile-search-wrapper mb-30">
              <SearchForm />
            </div>

            {/* Mobile Menu */}
            <div className="mobile-menu-3 fix mb-30 menu-counter mean-container d-lg-none">
              <div className="mean-bar">
                <MobileMenus setIsOffCanvasOpen={setIsOffCanvasOpen} />
              </div>
            </div>

            {/* Lang toggle — menünün altında, buton öncesi */}
            <div className="mb-30">
              <button
                onClick={toggleLang}
                className="header__lang-switch-btn"
                aria-label="Toggle language"
              >
                <span className={lang === "tr" ? "is-active" : ""}>TR</span>
                <span className="sep">/</span>
                <span className={lang === "en" ? "is-active" : ""}>EN</span>
              </button>
            </div>

            <div className="offcanvas__btn">
              <a href="/shop" className="tp-btn-offcanvas" onClick={() => setIsOffCanvasOpen(false)}>
                {t('getStarted')} <i className="fa-regular fa-chevron-right"></i>
              </a>
            </div>
            <div className="offcanvas__social">
              <h3 className="offcanvas__social-title">{t('socialFollow')}</h3>
              <SocialLinks />
            </div>
            <div className="offcanvas__contact">
              <p className="offcanvas__contact-call">
                <a href={`tel:${supportPhone.replace(/\s+/g, "")}`}>{supportPhone}</a>
              </p>
              <p className="offcanvas__contact-mail">
                <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* overlay */}
      <div
        onClick={() => setIsOffCanvasOpen(false)}
        className={`body-overlay ${isOffCanvasOpen ? "opened" : ""}`}
      ></div>
    </React.Fragment>
  );
};

export default OffCanvas;

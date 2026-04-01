'use client';
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
// internal
import shape from "@assets/img/shape/offcanvas-shape-1.png";
import logo from "@assets/img/logo/logo-black.svg";
import MobileMenus from "./mobile-menus";
import SocialLinks from "@components/social";
import { useLanguage } from "src/context/LanguageContext";
import SearchForm from "@components/forms/search-form";
import useCartInfo from "@hooks/use-cart-info";
import { Cart, Heart, User } from "@svg/index";

const OffCanvas = ({ isOffCanvasOpen, setIsOffCanvasOpen }) => {
  const { t, lang, toggleLang } = useLanguage();
  const { quantity } = useCartInfo();
  const { wishlist } = useSelector((state) => state.wishlist);
  const { user: userInfo } = useSelector((state) => state.auth);

  return (
    <React.Fragment>
      <div
        className={`offcanvas__area offcanvas__area-1 ${
          isOffCanvasOpen ? "offcanvas-opened" : ""
        }`}
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
            <div className="offcanvas__top mb-30 d-flex justify-content-between align-items-center">
              <div className="offcanvas__logo logo">
                <Link href="/" onClick={() => setIsOffCanvasOpen(false)}>
                  <Image src={logo} alt="logo" />
                </Link>
              </div>
              {/* Lang toggle */}
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

            {/* Mobile Quick Actions: Profile / Wishlist / Cart */}
            <div className="offcanvas__action-bar mb-30 d-flex align-items-center gap-3">
              {/* Profile */}
              {userInfo?.imageURL ? (
                <Link href="/user-dashboard" onClick={() => setIsOffCanvasOpen(false)} className="offcanvas__action-icon">
                  <Image
                    src={userInfo.imageURL}
                    alt="user"
                    width={32}
                    height={32}
                    style={{ objectFit: "cover", borderRadius: "50%" }}
                  />
                  <span className="offcanvas__action-label">{t('profile')}</span>
                </Link>
              ) : userInfo?.name ? (
                <Link href="/user-dashboard" onClick={() => setIsOffCanvasOpen(false)} className="offcanvas__action-icon">
                  <span className="tp-user-login-avater" style={{ fontSize: "14px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {userInfo.name[0].toUpperCase()}
                  </span>
                  <span className="offcanvas__action-label">{t('profile')}</span>
                </Link>
              ) : (
                <Link href="/login" onClick={() => setIsOffCanvasOpen(false)} className="offcanvas__action-icon">
                  <User />
                  <span className="offcanvas__action-label">{t('login')}</span>
                </Link>
              )}

              {/* Wishlist */}
              <Link href="/wishlist" onClick={() => setIsOffCanvasOpen(false)} className="offcanvas__action-icon p-relative">
                <Heart />
                {wishlist.length > 0 && (
                  <span className="tp-item-count">{wishlist.length}</span>
                )}
                <span className="offcanvas__action-label">{t('wishlist')}</span>
              </Link>

              {/* Cart */}
              <Link href="/cart" onClick={() => setIsOffCanvasOpen(false)} className="offcanvas__action-icon p-relative">
                <Cart />
                {quantity > 0 && (
                  <span className="tp-item-count">{quantity}</span>
                )}
                <span className="offcanvas__action-label">{t('cart')}</span>
              </Link>
            </div>

            {/* Search */}
            <div className="mobile-search-wrapper mb-30">
              <SearchForm />
            </div>

            {/* Mobile Menu */}
            <div className="mobile-menu-3 fix mb-40 menu-counter mean-container d-lg-none">
              <div className="mean-bar">
                <MobileMenus />
              </div>
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
                <a href="tel:+902625815515">0 262 581 55 15</a>
              </p>
              <p className="offcanvas__contact-mail">
                <a href="mailto:info@serravit.com.tr">info@serravit.com.tr</a>
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


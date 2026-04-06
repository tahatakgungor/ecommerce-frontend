'use client';
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
// internal
import Menus from "./menus";
import logo from "@assets/img/logo/logo-black.svg";
import { Cart, Heart, Search, User } from "@svg/index";
import useSticky from "@hooks/use-sticky";
import CartSidebar from "@components/common/sidebar/cart-sidebar";
import OffCanvas from "@components/common/off-canvas";
import useCartInfo from "@hooks/use-cart-info";
import SearchForm from "@components/forms/search-form";
import { useLanguage } from "src/context/LanguageContext";
import { getNameInitial } from "src/utils/user-name";

const Header = ({ style_2 = false }) => {
  const { sticky } = useSticky();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { quantity } = useCartInfo();
  const { wishlist } = useSelector((state) => state.wishlist);
  const { user: userInfo } = useSelector((state) => state.auth);
  const { lang, toggleLang } = useLanguage();
  return (
    <>
      <header>
        <div className={`header__area ${style_2 ? "" : "header__transparent"}`}>
          <div
            className={`header__bottom-13 header__padding-7 header__black-3 header__bottom-border-4 ${
              style_2 ? "header__bottom-13-white" : "grey-bg-17"
            } header__sticky ${sticky ? "header-sticky" : ""}`}
            id="header-sticky"
          >
            <div className="container-fluid">
              <div className="mega-menu-wrapper p-relative">
                <div className="row align-items-center">
                  <div className="col-xxl-1 col-xl-2 col-lg-4 col-md-4 col-sm-5 col-8 header__mobile-logo-col">
                    <div className="logo">
                      <Link href="/">
                        <Image src={logo} alt="logo" />
                      </Link>
                    </div>
                  </div>
                  <div className="col-xxl-6 col-xl-7 d-none d-xl-block">
                    <div className="main-menu main-menu-13 pl-45 main-menu-ff-space">
                      <nav id="mobile-menu-3">
                        <Menus />
                      </nav>
                    </div>
                  </div>
                  <div className="col-xxl-5 col-xl-3 col-lg-8 col-md-8 col-sm-7 col-4 header__mobile-actions-col">
                    <div className="header__bottom-right-13 d-flex justify-content-end align-items-center">
                      <div className="header__search-13 d-none d-xxl-block">
                        <SearchForm/>
                      </div>
                      <div className="header__action-13 header__action-13-clean">
                        <ul className="header__action-list">
                          <li className="d-xxl-none">
                            <a href="#" onClick={(e) => { e.preventDefault(); setIsSearchOpen(!isSearchOpen); }}>
                              <Search />
                            </a>
                          </li>
                          {userInfo?.imageURL ? (
                            <li>
                              <Link href="/user-dashboard">
                                <Image
                                  src={userInfo.imageURL}
                                  alt="user img"
                                  width={35}
                                  height={35}
                                  style={{
                                    objectFit: "cover",
                                    borderRadius: "50%",
                                  }}
                                />
                              </Link>
                            </li>
                          ) : (userInfo?.firstName || userInfo?.lastName || userInfo?.name) ? (
                            <li>
                              <Link href="/user-dashboard">
                                <span className="text-uppercase tp-user-login-avater" aria-label="Kullanıcı profili">
                                  {getNameInitial(userInfo)}
                                </span>
                              </Link>
                            </li>
                          ) : (
                            <li>
                              <Link href="/login">
                                <User />
                              </Link>
                            </li>
                          )}
                          <li>
                            <Link href="/wishlist">
                              <Heart />
                              <span className="tp-item-count">
                                {wishlist.length}
                              </span>
                            </Link>
                          </li>
                          <li className="header__action-cart">
                            <button
                              className="cartmini-open-btn header__action-icon-btn"
                              onClick={() => setIsCartOpen(!isCartOpen)}
                            >
                              <Cart />
                              <span className="tp-item-count">{quantity}</span>
                            </button>
                          </li>
                        </ul>
                      </div>
                      <div className="header__lang-inline d-none d-xl-flex">
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
                      <div className="header__hamburger d-xl-none">
                        <button
                          onClick={() => setIsOffCanvasOpen(true)}
                          type="button"
                          className="hamburger-btn hamburger-btn-black offcanvas-open-btn"
                          aria-label="Menüyü aç"
                          aria-expanded={isOffCanvasOpen}
                          aria-controls="offcanvas-menu"
                        >
                          <span></span>
                          <span></span>
                          <span></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {isSearchOpen && (
              <div className="container-fluid d-xxl-none pb-20 pt-10" style={{ borderTop: "1px solid #eaeaea" }}>
                <SearchForm />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* cart mini area start */}
      <CartSidebar isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
      {/* cart mini area end */}

      {/* off canvas start */}
      <OffCanvas
        isOffCanvasOpen={isOffCanvasOpen}
        setIsOffCanvasOpen={setIsOffCanvasOpen}
      />
      {/* off canvas end */}
    </>
  );
};

export default Header;

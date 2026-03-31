'use client';
import Link from "next/link";
import Image from "next/image";
// internal
import logo from '@assets/img/logo/logo-black.svg';
import payment from '@assets/img/footer/footer-payment.png';
import SocialLinks from "@components/social";
import CopyrightText from "./copyright-text";
import { useLanguage } from "src/context/LanguageContext";

const Footer = () => {
  const { t, lang } = useLanguage();

  const corporateLinks = [
    { url: "about",   title: t('about') },
    { url: "shop",    title: t('shop') },
    { url: "contact", title: lang === "tr" ? "Bayilik" : "Dealership" },
    { url: "contact", title: "Blog" },
    { url: "contact", title: lang === "tr" ? "Belgelerimiz" : "Documents" },
  ];

  const categoryLinks = [
    { url: "shop", title: lang === "tr" ? "Gıda Takviyesi"     : "Food Supplements" },
    { url: "shop", title: lang === "tr" ? "Cilt Bakımı"        : "Skin Care" },
    { url: "shop", title: lang === "tr" ? "Saç Bakımı"         : "Hair Care" },
    { url: "shop", title: lang === "tr" ? "Detoks Programları" : "Detox Programs" },
    { url: "shop", title: lang === "tr" ? "Kampanyalar"        : "Campaigns" },
  ];

  const supportLinks = [
    { url: "faq",     title: t('faqs') },
    { url: "contact", title: lang === "tr" ? "Yorumlar"          : "Reviews" },
    { url: "contact", title: t('contactUs') },
    { url: "contact", title: lang === "tr" ? "Kargo & Teslimat"  : "Shipping & Delivery" },
    { url: "contact", title: lang === "tr" ? "İade & Değişim"    : "Returns & Exchanges" },
  ];

  return (
    <>
      <footer>
        <div className="footer__area footer__style-4" data-bg-color="footer-bg-white">
          <div className="footer__top">
            <div className="container">
              <div className="row">
                {/* Logo + tagline */}
                <div className="col-xxl-3 col-xl-3 col-lg-3 col-md-5 col-sm-6">
                  <div className="footer__widget footer__widget-11 mb-50 footer-col-11-1">
                    <div className="footer__logo">
                      <Link href="/"><Image src={logo} alt="logo" /></Link>
                    </div>
                    <div className="footer__widget-content">
                      <div className="footer__info">
                        <p>{t('footerTagline')}</p>
                        <div className="footer__social footer__social-11">
                          <SocialLinks />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kurumsal */}
                <div className="col-xxl-2 col-xl-2 col-lg-3 col-md-4 col-sm-6">
                  <div className="footer__widget mb-50 footer-col-11-2">
                    <h3 className="footer__widget-title">{t('corporate')}</h3>
                    <div className="footer__widget-content">
                      <ul>
                        {corporateLinks.map((l, i) => (
                          <li key={i}><Link href={`/${l.url}`}>{l.title}</Link></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Kategoriler */}
                <div className="col-xxl-3 col-xl-3 col-lg-3 col-md-3 col-sm-6">
                  <div className="footer__widget mb-50 footer-col-11-3">
                    <h3 className="footer__widget-title">{t('categories')}</h3>
                    <div className="footer__widget-content">
                      <ul>
                        {categoryLinks.map((l, i) => (
                          <li key={i}><Link href={`/${l.url}`}>{l.title}</Link></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Destek */}
                <div className="col-xxl-1 col-xl-1 col-lg-3 col-md-3 col-sm-6">
                  <div className="footer__widget mb-50 footer-col-11-4">
                    <h3 className="footer__widget-title">{t('support')}</h3>
                    <div className="footer__widget-content">
                      <ul>
                        {supportLinks.map((l, i) => (
                          <li key={i}><Link href={`/${l.url}`}>{l.title}</Link></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* İletişim */}
                <div className="col-xxl-3 col-xl-3 col-lg-3 col-md-5 col-sm-6">
                  <div className="footer__widget mb-50 footer-col-11-5">
                    <h3 className="footer__widget-title">{t('talkToUs')}</h3>
                    <div className="footer__widget-content">
                      <p className="footer__text">
                        {lang === "tr"
                          ? "Kandıra, Kocaeli adresimizi ziyaret edin veya bize ulaşın."
                          : "Visit us in Kandıra, Kocaeli or get in touch."}
                      </p>
                      <div className="footer__contact">
                        <div className="footer__contact-call">
                          <span><a href="tel:02625815515">0 262 581 55 15</a></span>
                        </div>
                        <div className="footer__contact-mail">
                          <span><a href="mailto:info@serravit.com.tr">info@serravit.com.tr</a></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="footer__bottom">
            <div className="container">
              <div className="footer__bottom-inner">
                <div className="row">
                  <div className="col-sm-6">
                    <div className="footer__copyright">
                      <CopyrightText />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="footer__payment text-sm-end">
                      <Image src={payment} alt="payment" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;

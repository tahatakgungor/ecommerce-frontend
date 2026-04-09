'use client';
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
// internal
import logo from '@assets/img/logo/logo-black.svg';
import payment from '@assets/img/footer/footer-payment.png';
import SocialLinks from "@components/social";
import CopyrightText from "./copyright-text";
import { useLanguage } from "src/context/LanguageContext";
import { useSubscribeNewsletterMutation } from "src/redux/features/auth/authApi";
import { notifySuccess, notifyError } from "@utils/toast";
import { useGetSiteSettingsQuery } from "src/redux/features/siteSettingsApi";

const Footer = () => {
  const { t, lang } = useLanguage();
  const { data: siteSettings } = useGetSiteSettingsQuery();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribeNewsletter, { isLoading: isSubscribing }] = useSubscribeNewsletterMutation();

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      const res = await subscribeNewsletter({ email: newsletterEmail }).unwrap();
      notifySuccess(res?.message || "Bültenimize abone oldunuz!");
      setNewsletterEmail("");
    } catch (err) {
      notifyError(err?.data?.message || "Abonelik sırasında bir hata oluştu.");
    }
  };

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
    { url: "order-lookup", title: lang === "tr" ? "Sipariş Takibi" : "Order Tracking" },
    { url: "contact", title: lang === "tr" ? "Kargo & Teslimat"  : "Shipping & Delivery" },
    { url: "contact", title: lang === "tr" ? "İade & Değişim"    : "Returns & Exchanges" },
  ];
  const supportPhone = siteSettings?.supportPhone || "0 262 581 55 15";
  const supportEmail = siteSettings?.supportEmail || "info@serravit.com.tr";
  const whatsappNumberRaw = siteSettings?.whatsappNumber || "905322254155";
  const whatsappNumber = whatsappNumberRaw.replace(/\D+/g, "");
  const whatsappHref = `https://wa.me/${whatsappNumber}`;

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
                          <span><a href={`tel:${supportPhone.replace(/\s+/g, "")}`}>{supportPhone}</a></span>
                        </div>
                        <div className="footer__contact-mail">
                          <span><a href={`mailto:${supportEmail}`}>{supportEmail}</a></span>
                        </div>
                        <div className="footer__contact-mail">
                          <span><a href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp</a></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="footer__newsletter" style={{ background: "#f5f5f5", borderTop: "1px solid #e8e8e8" }}>
            <div className="container">
              <div className="row justify-content-center py-4">
                <div className="col-lg-6 col-md-8">
                  <div className="text-center mb-3">
                    <h5 style={{ fontWeight: 700, color: "#333" }}>
                      {lang === "tr" ? "Kampanya ve Fırsatlardan Haberdar Ol" : "Stay Updated on Campaigns & Deals"}
                    </h5>
                    <p style={{ color: "#777", fontSize: "14px" }}>
                      {lang === "tr" ? "E-posta adresinizi girin, özel fırsatları kaçırmayın." : "Enter your email to never miss a deal."}
                    </p>
                  </div>
                  <form onSubmit={handleNewsletterSubmit} className="footer__newsletter-form">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder={lang === "tr" ? "E-posta adresiniz" : "Your email address"}
                      required
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isSubscribing}
                      className="tp-btn footer__newsletter-btn"
                      style={{ padding: "10px 20px" }}
                    >
                      {isSubscribing
                        ? (lang === "tr" ? "Gönderiliyor..." : "Sending...")
                        : (lang === "tr" ? "Abone Ol" : "Subscribe")}
                    </button>
                  </form>
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

'use client';
import React from "react";
import Image from "next/image";
// internal
import SocialLinks from "@components/social";
import icon_1 from "@assets/img/contact/icon/contact-icon-1.png";
import icon_2 from "@assets/img/contact/icon/contact-icon-3.png";
import icon_3 from "@assets/img/contact/icon/contact-icon-2.png";
import { useLanguage } from "src/context/LanguageContext";
import { useGetSiteSettingsQuery } from "src/redux/features/siteSettingsApi";

// single item
function SingleItem({ icon, title, content }) {
  return (
    <div className="col-xl-4 col-lg-4 col-md-6">
      <div className="contact__item text-center mb-30 transition-3 white-bg">
        <div className="contact__icon">
          <Image src={icon} alt="icon" />
        </div>
        <div className="contact__content">
          <span className="contact-item-subtitle">{title}</span>
          {content}
        </div>
      </div>
    </div>
  );
}

const BoxItems = () => {
  const { lang } = useLanguage();
  const { data: siteSettings } = useGetSiteSettingsQuery();
  const isTr = lang === "tr";
  const supportPhone = siteSettings?.supportPhone || "0 262 581 55 15";
  const supportEmail = siteSettings?.supportEmail || "info@serravit.com.tr";
  const whatsappNumberRaw = siteSettings?.whatsappNumber || "905322254155";
  const whatsappNumber = whatsappNumberRaw.replace(/\D+/g, "");
  const whatsappLabel = siteSettings?.whatsappLabel || `+${whatsappNumber}`;
  return (
    <div className="contact__item-area pt-60 pb-30">
      <div className="container">
        <div className="row">
          <SingleItem
            icon={icon_1}
            title={isTr ? "İletişim" : "Contact"}
            content={
              <>
                <p>
                  <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
                </p>
                <p>
                  <a href={`tel:${supportPhone.replace(/\s+/g, "")}`}>{supportPhone}</a>
                </p>
                <p>
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer">
                    WhatsApp: {whatsappLabel}
                  </a>
                </p>
              </>
            }
          />
          <SingleItem
            icon={icon_2}
            title={isTr ? "Adres" : "Address"}
            content={
              <>
                <p>
                  <a
                    rel="noreferrer"
                    href="https://maps.google.com/?q=Kocakaymas+Mahallesi+Eski+Kandıra+Caddesi+No:12+Kandıra+Kocaeli"
                    target="_blank"
                  >
                    Kocakaymas Mah. Eski Kandıra Cad. No:12
                    <br />
                    Kandıra / Kocaeli
                  </a>
                </p>
              </>
            }
          />
          <SingleItem
            icon={icon_3}
            title={isTr ? "Sosyal Medya" : "Social Media"}
            content={
              <>
                <p>{isTr ? "Bizi sosyal medyada takip edin" : "Follow us on social media"}</p>
                <div className="contact__social">
                  <SocialLinks />
                </div>
              </>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default BoxItems;

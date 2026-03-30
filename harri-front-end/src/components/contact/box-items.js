import React from "react";
import Image from "next/image";
// internal
import SocialLinks from "@components/social";
import icon_1 from "@assets/img/contact/icon/contact-icon-1.png";
import icon_2 from "@assets/img/contact/icon/contact-icon-3.png";
import icon_3 from "@assets/img/contact/icon/contact-icon-2.png";

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
  return (
    <div className={`contact__item-area contact__translate-2`}>
      <div className="container">
        <div className="row">
          <SingleItem
            icon={icon_1}
            title="İletişim"
            content={
              <>
                <p>
                  <a href="mailto:info@serravit.com.tr">info@serravit.com.tr</a>
                </p>
                <p>
                  <a href="tel:02625815515">0 262 581 55 15</a>
                </p>
                <p>
                  <a href="https://wa.me/905322254155" target="_blank" rel="noreferrer">
                    WhatsApp: +90 532 225 41 55
                  </a>
                </p>
              </>
            }
          />
          <SingleItem
            icon={icon_2}
            title="Adres"
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
            title="Sosyal Medya"
            content={
              <>
                <p>Bizi sosyal medyada takip edin</p>
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

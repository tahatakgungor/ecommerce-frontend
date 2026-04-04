'use client';
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { RightArrow } from "@svg/index";
import { useLanguage } from "src/context/LanguageContext";

const HeroBanner = () => {
  const { t } = useLanguage();
  return (
    <>
      <section className="slider__area">
        <div
          className="slider__item-13 slider__height-13 d-flex align-items-end"
          style={{
            backgroundImage: "url('/assets/img/slider/13/slider-1.png')",
            backgroundSize: "cover",
            backgroundPosition: "center right",
            backgroundRepeat: "no-repeat",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, rgba(245,252,240,0.92) 0%, rgba(245,252,240,0.7) 50%, rgba(245,252,240,0.1) 100%)",
            }}
          />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <div className="row align-self-end">
              <div className="col-xl-6 col-lg-6">
                <div className="slider__content-13">
                  <span className="slider__title-pre-13">
                    {t('heroSubtitle')}
                  </span>
                  <h3 className="slider__title-13">
                    {t('heroTitle').split('\n').map((line, i) => (
                      <React.Fragment key={i}>{line}{i === 0 && <br />}</React.Fragment>
                    ))}
                  </h3>
                  <div style={{ marginBottom: "18px", maxWidth: "520px" }}>
                    <Image
                      src="/assets/img/logo/humat-logo.jpg"
                      alt="Humat Kimya"
                      width={1100}
                      height={250}
                      sizes="(max-width: 576px) 88vw, (max-width: 992px) 60vw, 520px"
                      style={{ width: "100%", height: "auto", objectFit: "contain" }}
                      priority
                    />
                  </div>
                  <div className="slider__btn-13">
                    <Link href="/shop" className="tp-btn-border">
                      {t('shopNow')}
                      <span>
                        <RightArrow />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroBanner;

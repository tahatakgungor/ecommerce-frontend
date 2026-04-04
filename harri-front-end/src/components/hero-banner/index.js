'use client';
import React from "react";
import Link from "next/link";
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
            backgroundImage: "none",
            backgroundColor: "#ffffff",
            position: "relative",
          }}
        >
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

'use client';
import React from "react";
import Link from "next/link";
import Slider from "react-slick";
import { useRouter } from "next/navigation";
import { RightArrow } from "@svg/index";
import { useLanguage } from "src/context/LanguageContext";
import { useGetShowingBannersQuery } from "src/redux/features/bannerApi";

const sliderSettings = {
  dots: true,
  arrows: false,
  dotsClass: "slick-dots hero-banner__dots",
  infinite: true,
  speed: 600,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,
  pauseOnHover: true,
  swipeToSlide: true,
};

const staticFallbackBanner = {
  id: "fallback",
  title: "",
  subtitle: "",
  ctaLabel: "",
  ctaLink: "/shop",
  imageUrl: "/assets/img/slider/13/slider-1.png",
  imageAlt: "Hero Banner",
  openInNewTab: false,
};

const isExternalUrl = (url) => /^https?:\/\//i.test(String(url || ""));

const HeroBanner = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { data, isLoading } = useGetShowingBannersQuery();
  const apiBanners = Array.isArray(data?.banners) ? data.banners : [];
  const hasLoaded = !isLoading;
  const banners = hasLoaded
    ? (apiBanners.length > 0 ? apiBanners : [staticFallbackBanner])
    : [];

  const renderCta = (banner) => {
    const ctaLabel = banner?.ctaLabel?.trim() || t("shopNow");
    const href = banner?.ctaLink?.trim() || "/shop";
    if (isExternalUrl(href)) {
      return (
        <a
          href={href}
          target={banner?.openInNewTab ? "_blank" : "_self"}
          rel={banner?.openInNewTab ? "noreferrer" : undefined}
          className="tp-btn-border"
        >
          {ctaLabel}
          <span>
            <RightArrow />
          </span>
        </a>
      );
    }
    return (
      <Link href={href} className="tp-btn-border">
        {ctaLabel}
        <span>
          <RightArrow />
        </span>
      </Link>
    );
  };

  const navigateToBanner = (banner) => {
    const href = banner?.ctaLink?.trim();
    if (!href) return;
    if (isExternalUrl(href)) {
      window.open(href, banner?.openInNewTab ? "_blank" : "_self", "noopener,noreferrer");
      return;
    }
    if (banner?.openInNewTab) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(href);
  };

  return (
    <section className="slider__area hero-banner__area">
      {isLoading ? (
        <div
          className="slider__item-13 slider__height-13 hero-banner__slide d-flex align-items-end"
          style={{ background: "#ffffff" }}
          aria-label="Banner loading"
        />
      ) : (
        <Slider {...sliderSettings}>
          {banners.map((banner, index) => (
            <div key={banner?.id || `hero-banner-${index}`}>
              <div
                className="slider__item-13 slider__height-13 hero-banner__slide d-flex align-items-end"
                role={banner?.ctaLink ? "link" : undefined}
                tabIndex={banner?.ctaLink ? 0 : undefined}
                onClick={() => navigateToBanner(banner)}
                onKeyDown={(event) => {
                  if (!banner?.ctaLink) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigateToBanner(banner);
                  }
                }}
                style={{
                  backgroundImage: `url('${banner?.imageUrl || staticFallbackBanner.imageUrl}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center right",
                  backgroundRepeat: "no-repeat",
                  position: "relative",
                  cursor: banner?.ctaLink ? "pointer" : "default",
                }}
                aria-label={banner?.imageAlt || banner?.title || `banner-${index + 1}`}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(90deg, rgba(252,255,252,0.48) 0%, rgba(252,255,252,0.16) 42%, rgba(252,255,252,0.02) 74%), radial-gradient(circle at 78% 24%, rgba(61, 167, 96, 0.18) 0%, rgba(61, 167, 96, 0) 46%)",
                  }}
                />
                <div className="container" style={{ position: "relative", zIndex: 1 }}>
                  <div className="row align-self-end">
                    <div className="col-xl-6 col-lg-6">
                      <div className="slider__content-13">
                        <span className="slider__title-pre-13">
                          {banner?.subtitle?.trim() || t("heroSubtitle")}
                        </span>
                        <h3 className="slider__title-13 hero-banner__title">
                          {(banner?.title?.trim() || t("heroTitle"))
                            .split("\n")
                            .map((line, lineIndex) => (
                              <React.Fragment key={lineIndex}>
                                {line}
                                {lineIndex < (banner?.title?.trim() || t("heroTitle")).split("\n").length - 1 && <br />}
                              </React.Fragment>
                            ))}
                        </h3>
                        <div
                          className="slider__btn-13"
                          onClick={(event) => {
                            event.stopPropagation();
                          }}
                        >
                          {renderCta(banner)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      )}
    </section>
  );
};

export default HeroBanner;

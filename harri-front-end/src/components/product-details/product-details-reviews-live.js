'use client';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  useGetProductReviewsQuery,
  useGetProductReviewSummaryQuery,
  useVoteProductReviewMutation,
} from "src/redux/features/productApi";
import { notifyError } from "@utils/toast";
import { useLanguage } from "src/context/LanguageContext";
import { getRatingVisualState } from "src/utils/rating-visual";
import { getActiveReviewFilterChips, hasActiveReviewFilters } from "src/utils/review-filters";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function normalizeMediaUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("/")) {
    return API_BASE_URL ? `${API_BASE_URL}${trimmed}` : trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname?.toLowerCase();
    if ((host === "localhost" || host === "127.0.0.1") && API_BASE_URL) {
      return `${API_BASE_URL}${parsed.pathname}${parsed.search || ""}${parsed.hash || ""}`;
    }
    return trimmed;
  } catch {
    return API_BASE_URL ? `${API_BASE_URL}/${trimmed.replace(/^\/+/, "")}` : trimmed;
  }
}

function StarRow({ label, percentage, count, isActive, onSelect, lang }) {
  const buttonLabel =
    lang === "tr"
      ? `${label} yıldızlı yorumları filtrele`
      : `Filter reviews with exactly ${label} stars`;

  return (
    <button
      type="button"
      className={`product-rating-bar-item product-rating-bar-item--interactive d-flex align-items-center ${isActive ? "is-active" : ""}`}
      onClick={onSelect}
      aria-pressed={isActive}
      title={buttonLabel}
    >
      <div className="product-rating-bar-text">
        <span>{label}</span>
      </div>
      <div className="product-rating-bar">
        <div className="single-progress" style={{ width: `${percentage || 0}%` }}></div>
      </div>
      <div className="product-rating-bar-count">
        <span>{count || 0}</span>
      </div>
    </button>
  );
}

function StarDisplay({ value }) {
  const { fullStars, showHalfOnFifthStar } = getRatingVisualState(value);

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const isHalfFifth = showHalfOnFifthStar && i === 5;
    stars.push(
      <span
        key={i}
        className={isHalfFifth ? "tp-rating-summary__star tp-rating-summary__star--half" : ""}
      >
        {isHalfFifth ? (
          <>
            <i className="icon_star_alt tp-rating-summary__star-empty"></i>
            <i className="icon_star tp-rating-summary__star-fill"></i>
          </>
        ) : (
          <i className={i <= fullStars ? "icon_star" : "icon_star_alt"}></i>
        )}
      </span>
    );
  }
  return <div className="product-review-rating-wrapper d-flex">{stars}</div>;
}

function getSortLabel(sort, lang) {
  if (sort === "highest") {
    return lang === "tr" ? "En Yüksek Puan" : "Highest Rated";
  }
  if (sort === "most_helpful") {
    return lang === "tr" ? "En Faydalı" : "Most Helpful";
  }
  return lang === "tr" ? "En Yeniler" : "Newest";
}

const ProductDetailsReviewsLive = ({ productId }) => {
  const { t, lang } = useLanguage();
  const [sort, setSort] = useState("newest");
  const [withMedia, setWithMedia] = useState(false);
  const [exactRating, setExactRating] = useState(null);
  const [minRating, setMinRating] = useState(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [openMenu, setOpenMenu] = useState(null);
  const [lightbox, setLightbox] = useState({
    open: false,
    mediaUrls: [],
    index: 0,
  });
  const filterBarRef = useRef(null);

  const { user } = useSelector((state) => state.auth);

  const {
    data: reviewData,
    isLoading: reviewsLoading,
    isFetching: reviewsFetching,
  } = useGetProductReviewsQuery(
    { productId, sort, withMedia, exactRating, minRating, verifiedOnly, page, size: 8 },
    { skip: !productId }
  );

  const { data: summaryData } = useGetProductReviewSummaryQuery(productId, {
    skip: !productId,
  });

  const [voteReview] = useVoteProductReviewMutation();

  const summary = useMemo(() => {
    const fromList = reviewData?.data?.summary || reviewData?.summary;
    const direct = summaryData?.data || summaryData;
    return fromList || direct || {
      averageRating: 0,
      totalReviews: 0,
      starCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      starPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }, [reviewData, summaryData]);

  const list = useMemo(
    () => reviewData?.data?.reviews || reviewData?.reviews || [],
    [reviewData]
  );
  const totalPages = reviewData?.data?.totalPages ?? reviewData?.totalPages ?? 0;
  const totalElements = reviewData?.data?.totalElements ?? reviewData?.totalElements ?? 0;
  const activeFilterChips = useMemo(
    () => getActiveReviewFilterChips({ lang, sort, withMedia, exactRating, minRating, verifiedOnly }),
    [lang, sort, withMedia, exactRating, minRating, verifiedOnly]
  );
  const hasFilters = useMemo(
    () => hasActiveReviewFilters({ lang, sort, withMedia, exactRating, minRating, verifiedOnly }),
    [lang, sort, withMedia, exactRating, minRating, verifiedOnly]
  );
  const activeFilterCount = activeFilterChips.length;
  const sortLabel = useMemo(() => getSortLabel(sort, lang), [sort, lang]);

  const updateFilters = (updater) => {
    updater();
    setPage(0);
  };

  const clearFilters = () => {
    setSort("newest");
    setWithMedia(false);
    setExactRating(null);
    setMinRating(null);
    setVerifiedOnly(false);
    setPage(0);
  };

  const onVote = async (reviewId, helpful) => {
    if (!user) {
      notifyError(lang === "tr" ? "Oy vermek için giriş yapmalısınız." : "Please sign in to vote.");
      return;
    }
    try {
      await voteReview({ productId, reviewId, helpful }).unwrap();
    } catch (err) {
      notifyError(err?.data?.message || (lang === "tr" ? "Oy işlemi başarısız." : "Vote failed."));
    }
  };

  const openLightbox = (mediaUrls, index) => {
    setLightbox({
      open: true,
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
      index,
    });
  };

  const closeLightbox = () => {
    setLightbox({ open: false, mediaUrls: [], index: 0 });
  };

  const showPrevMedia = () => {
    setLightbox((prev) => {
      if (!prev.mediaUrls.length) return prev;
      const nextIndex = (prev.index - 1 + prev.mediaUrls.length) % prev.mediaUrls.length;
      return { ...prev, index: nextIndex };
    });
  };

  const showNextMedia = () => {
    setLightbox((prev) => {
      if (!prev.mediaUrls.length) return prev;
      const nextIndex = (prev.index + 1) % prev.mediaUrls.length;
      return { ...prev, index: nextIndex };
    });
  };

  useEffect(() => {
    if (!lightbox.open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPrevMedia();
      if (event.key === "ArrowRight") showNextMedia();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox.open]);

  useEffect(() => {
    if (!openMenu) return;
    const handlePointerDown = (event) => {
      if (!filterBarRef.current?.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openMenu]);

  return (
    <div className="product__details-review pt-60">
      <div className="row">
        <div className="col-xl-9">
          <div className="product__details-review-inner">
            <div className="product-rating">
              <h4 className="product-rating-title">{t("reviews")}</h4>
              <div className="product-rating-wrapper d-flex flex-wrap align-items-center mb-40">
                <div className="product-rating-number mr-40">
                  <h4 className="product-rating-number-title">{Number(summary?.averageRating || 0).toFixed(1)}</h4>
                  <div className="product-rating-star">
                    <StarDisplay value={summary?.averageRating || 0} />
                  </div>
                  <p className="mb-0 mt-10">{summary?.totalReviews || 0} {lang === "tr" ? "yorum" : "reviews"}</p>
                </div>
                <div className="product-rating-bar-wrapper">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <StarRow
                      key={rating}
                      label={String(rating)}
                      percentage={summary?.starPercentages?.[rating]}
                      count={summary?.starCounts?.[rating]}
                      isActive={exactRating === rating}
                      lang={lang}
                      onSelect={() =>
                        updateFilters(() => {
                          setExactRating((current) => (current === rating ? null : rating));
                          setMinRating(null);
                        })
                      }
                    />
                  ))}
                </div>
              </div>
              <p className="product-rating-bar-hint mb-0">
                {lang === "tr"
                  ? "Yıldız dağılımına tıklayarak tam puana göre filtreleyin."
                  : "Tap a star row to filter by the exact rating."}
              </p>
            </div>

            <div className="product-review-toolbar mb-30" ref={filterBarRef}>
              <div className="product-review-toolbar__actions">
                <button
                  type="button"
                  className={`product-review-toolbar__trigger ${openMenu === "filter" ? "is-open" : ""}`}
                  onClick={() => setOpenMenu((current) => (current === "filter" ? null : "filter"))}
                  aria-expanded={openMenu === "filter"}
                >
                  <span>{lang === "tr" ? "Filtrele" : "Filter"}</span>
                  <span className="product-review-toolbar__meta">
                    {activeFilterCount > 0 ? activeFilterCount : (lang === "tr" ? "Tümü" : "All")}
                  </span>
                </button>

                <button
                  type="button"
                  className={`product-review-toolbar__trigger ${openMenu === "sort" ? "is-open" : ""}`}
                  onClick={() => setOpenMenu((current) => (current === "sort" ? null : "sort"))}
                  aria-expanded={openMenu === "sort"}
                >
                  <span>{lang === "tr" ? "Sırala" : "Sort"}</span>
                  <span className="product-review-toolbar__meta">{sortLabel}</span>
                </button>

                {hasFilters && (
                  <button
                    type="button"
                    className="product-review-toolbar__clear"
                    onClick={clearFilters}
                  >
                    {lang === "tr" ? "Temizle" : "Clear"}
                  </button>
                )}
              </div>

              {openMenu === "filter" && (
                <div className="product-review-toolbar__panel">
                  <div className="product-review-filter-group">
                    <span className="product-review-filter-group__label">
                      {lang === "tr" ? "Öne Çıkanlar" : "Highlights"}
                    </span>
                    <div className="product-review-filter-group__actions">
                      <button className={`tp-btn-border ${withMedia ? "active" : ""}`} onClick={() => updateFilters(() => setWithMedia((v) => !v))} type="button">
                        {lang === "tr" ? "Fotoğraflı" : "With Media"}
                      </button>
                      <button className={`tp-btn-border ${verifiedOnly ? "active" : ""}`} onClick={() => updateFilters(() => setVerifiedOnly((v) => !v))} type="button">
                        {lang === "tr" ? "Doğrulanmış Alıcı" : "Verified Purchase"}
                      </button>
                    </div>
                  </div>

                  <div className="product-review-filter-group">
                    <span className="product-review-filter-group__label">
                      {lang === "tr" ? "Puan Aralığı" : "Rating Range"}
                    </span>
                    <div className="product-review-filter-group__actions">
                      {[5, 4, 3].map((rating) => (
                        <button
                          key={rating}
                          className={`tp-btn-border ${minRating === rating ? "active" : ""}`}
                          onClick={() => updateFilters(() => {
                            setMinRating((current) => (current === rating ? null : rating));
                            setExactRating(null);
                          })}
                          type="button"
                        >
                          {lang === "tr" ? `${rating} yıldız ve üzeri` : `${rating}+ stars`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {openMenu === "sort" && (
                <div className="product-review-toolbar__panel product-review-toolbar__panel--narrow">
                  {[
                    { value: "newest", label: lang === "tr" ? "En Yeniler" : "Newest" },
                    { value: "highest", label: lang === "tr" ? "En Yüksek Puan" : "Highest Rated" },
                    { value: "most_helpful", label: lang === "tr" ? "En Faydalı" : "Most Helpful" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`product-review-toolbar__option ${sort === option.value ? "is-active" : ""}`}
                      onClick={() => {
                        updateFilters(() => setSort(option.value));
                        setOpenMenu(null);
                      }}
                    >
                      <span>{option.label}</span>
                      {sort === option.value && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {hasFilters && (
              <div className="mb-20">
                <div className="product-review-active-chips mb-2">
                  {activeFilterChips.map((chip) => (
                    <span
                      key={chip.key}
                      className="product-review-active-chip"
                    >
                      {chip.label}
                    </span>
                  ))}
                </div>
                <p className="product-review-active-copy mb-0">
                  {lang === "tr"
                    ? `${totalElements} yorum bu filtrelerle eşleşiyor.`
                    : `${totalElements} reviews match these filters.`}
                </p>
              </div>
            )}

            <div className="product-review-form mb-30">
              <p className="mb-0 text-muted">
                {lang === "tr"
                  ? "Yorum yazma işlemi yalnızca Siparişlerim alanından yapılabilir."
                  : "Writing reviews is available only from My Orders."}
              </p>
            </div>

            <div className="product__details-review-list mb-45">
              {reviewsLoading && (
                <p>{lang === "tr" ? "Yorumlar yükleniyor..." : "Loading reviews..."}</p>
              )}

              {reviewsFetching && !reviewsLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280", marginBottom: 10 }}>
                  <span style={{ width: 16, height: 16, border: "2px solid #e5e7eb", borderTopColor: "#374151", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block", flexShrink: 0 }} />
                  {lang === "tr" ? "Yorumlar güncelleniyor..." : "Refreshing reviews..."}
                </div>
              )}

              {!reviewsLoading && !reviewsFetching && list.length === 0 && (
                <p>
                  {hasFilters
                    ? (lang === "tr" ? "Seçili filtrelere uygun yorum bulunamadı." : "No reviews match the selected filters.")
                    : (lang === "tr" ? "Henüz onaylı yorum yok." : "No approved reviews yet.")}
                </p>
              )}

              {list.map((item) => (
                <div key={item.reviewId} className="product-review-item">
                  <div className="product-review-avater d-flex align-items-center">
                    <div className="product-review-avater-info">
                      <h4 className="product-review-avater-title">{item.userName || "Kullanıcı"}</h4>
                      <span>{item?.verifiedPurchase ? (lang === "tr" ? "Doğrulanmış Alıcı" : "Verified Purchase") : ""}</span>
                    </div>
                  </div>

                  <div className="product-review-rating d-flex align-items-center">
                    <StarDisplay value={item.rating || 0} />
                    <div className="product-review-rating-date">
                      <span>{item?.createdAt ? new Date(item.createdAt).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US") : ""}</span>
                    </div>
                  </div>

                  {item?.commentTitle && <h5 className="mt-10 mb-5">{item.commentTitle}</h5>}
                  <p>{item.commentBody}</p>

                  {!!item?.mediaUrls?.length && (
                    <div className="d-flex flex-wrap gap-2 mb-10">
                      {item.mediaUrls.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => openLightbox(item.mediaUrls, idx)}
                          title={lang === "tr" ? "Görseli büyüt" : "Open image"}
                          style={{
                            width: 76,
                            height: 76,
                            padding: 0,
                            borderRadius: 8,
                            border: "1px solid #e2e2e2",
                            overflow: "hidden",
                            background: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={normalizeMediaUrl(url)}
                            alt={`${lang === "tr" ? "Yorum görseli" : "Review media"} ${idx + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="d-flex flex-wrap gap-2">
                    <button type="button" className="tp-btn-border" onClick={() => onVote(item.reviewId, true)}>
                      {lang === "tr" ? "Faydalı" : "Helpful"} ({item.helpfulCount || 0})
                    </button>
                    <button type="button" className="tp-btn-border" onClick={() => onVote(item.reviewId, false)}>
                      {lang === "tr" ? "Faydalı Değil" : "Not Helpful"} ({item.notHelpfulCount || 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && list.length > 0 && (
              <div className="d-flex gap-2 mb-40">
                <button type="button" className="tp-btn-border" disabled={page <= 0} onClick={() => setPage((p) => Math.max(p - 1, 0))}>
                  {lang === "tr" ? "Önceki" : "Prev"}
                </button>
                <button type="button" className="tp-btn-border" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                  {lang === "tr" ? "Sonraki" : "Next"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {lightbox.open && !!lightbox.mediaUrls.length && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.78)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "min(960px, 100vw - 32px)",
              maxHeight: "min(86vh, 860px)",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={normalizeMediaUrl(lightbox.mediaUrls[lightbox.index])}
              alt={lang === "tr" ? "Yorum görseli büyük görünüm" : "Review media full view"}
              style={{
                maxWidth: "100%",
                maxHeight: "86vh",
                borderRadius: 12,
                objectFit: "contain",
                boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                background: "#fff",
              }}
            />

            <button
              type="button"
              onClick={closeLightbox}
              aria-label={lang === "tr" ? "Kapat" : "Close"}
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: "#fff",
                color: "#111",
                fontSize: 20,
                lineHeight: "36px",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            {lightbox.mediaUrls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevMedia}
                  aria-label={lang === "tr" ? "Önceki görsel" : "Previous image"}
                  style={{
                    position: "absolute",
                    left: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(255,255,255,0.92)",
                    fontSize: 22,
                    cursor: "pointer",
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={showNextMedia}
                  aria-label={lang === "tr" ? "Sonraki görsel" : "Next image"}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(255,255,255,0.92)",
                    fontSize: 22,
                    cursor: "pointer",
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsReviewsLive;

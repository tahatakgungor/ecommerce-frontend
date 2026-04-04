'use client';
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  useCreateProductReviewMutation,
  useGetProductReviewsQuery,
  useGetProductReviewSummaryQuery,
  useVoteProductReviewMutation,
} from "src/redux/features/productApi";
import { notifyError, notifySuccess } from "@utils/toast";
import { useLanguage } from "src/context/LanguageContext";
import { getRatingVisualState } from "src/utils/rating-visual";

const MAX_MEDIA = 5;

function StarRow({ label, percentage }) {
  return (
    <div className="product-rating-bar-item d-flex align-items-center">
      <div className="product-rating-bar-text">
        <span>{label}</span>
      </div>
      <div className="product-rating-bar">
        <div className="single-progress" style={{ width: `${percentage || 0}%` }}></div>
      </div>
    </div>
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

const ProductDetailsReviewsLive = ({ productId }) => {
  const { t, lang } = useLanguage();
  const [sort, setSort] = useState("newest");
  const [withMedia, setWithMedia] = useState(false);
  const [page, setPage] = useState(0);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [mediaRaw, setMediaRaw] = useState("");

  const { user } = useSelector((state) => state.auth);

  const {
    data: reviewData,
    isLoading: reviewsLoading,
    isFetching: reviewsFetching,
  } = useGetProductReviewsQuery(
    { productId, sort, withMedia, page, size: 8 },
    { skip: !productId }
  );

  const { data: summaryData } = useGetProductReviewSummaryQuery(productId, {
    skip: !productId,
  });

  const [createReview, { isLoading: createLoading }] = useCreateProductReviewMutation();
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

  const list = reviewData?.data?.reviews || reviewData?.reviews || [];
  const totalPages = reviewData?.data?.totalPages ?? reviewData?.totalPages ?? 0;

  const submitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      notifyError(lang === "tr" ? "Yorum için giriş yapmalısınız." : "Please sign in to write a review.");
      return;
    }

    if (!comment || comment.trim().length < 5) {
      notifyError(lang === "tr" ? "Yorum en az 5 karakter olmalı." : "Comment must be at least 5 characters.");
      return;
    }

    const mediaUrls = mediaRaw
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, MAX_MEDIA);

    try {
      const result = await createReview({
        productId,
        data: {
          rating,
          commentTitle: title.trim() || null,
          commentBody: comment.trim(),
          mediaUrls,
        },
      }).unwrap();

      notifySuccess(result?.message || (lang === "tr" ? "Yorumunuz kaydedildi, onay sonrası yayınlanacak." : "Review submitted. It will be published after approval."));
      setTitle("");
      setComment("");
      setMediaRaw("");
      setRating(5);
      setPage(0);
    } catch (err) {
      notifyError(err?.data?.message || (lang === "tr" ? "Yorum gönderilemedi." : "Review submission failed."));
    }
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
                  <StarRow label="5" percentage={summary?.starPercentages?.[5]} />
                  <StarRow label="4" percentage={summary?.starPercentages?.[4]} />
                  <StarRow label="3" percentage={summary?.starPercentages?.[3]} />
                  <StarRow label="2" percentage={summary?.starPercentages?.[2]} />
                  <StarRow label="1" percentage={summary?.starPercentages?.[1]} />
                </div>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mb-25">
              <button className={`tp-btn-border ${sort === "newest" ? "active" : ""}`} onClick={() => { setSort("newest"); setPage(0); }} type="button">
                {lang === "tr" ? "En Yeniler" : "Newest"}
              </button>
              <button className={`tp-btn-border ${sort === "highest" ? "active" : ""}`} onClick={() => { setSort("highest"); setPage(0); }} type="button">
                {lang === "tr" ? "En Yüksek Puan" : "Highest Rated"}
              </button>
              <button className={`tp-btn-border ${withMedia ? "active" : ""}`} onClick={() => { setWithMedia((v) => !v); setPage(0); }} type="button">
                {lang === "tr" ? "Fotoğraflı" : "With Media"}
              </button>
            </div>

            <div className="product__details-review-list mb-45">
              {(reviewsLoading || reviewsFetching) && (
                <p>{lang === "tr" ? "Yorumlar yükleniyor..." : "Loading reviews..."}</p>
              )}

              {!reviewsLoading && !reviewsFetching && list.length === 0 && (
                <p>{lang === "tr" ? "Henüz onaylı yorum yok." : "No approved reviews yet."}</p>
              )}

              {list.map((item) => (
                <div key={item.reviewId} className="product-review-item">
                  <div className="product-review-avater d-flex align-items-center">
                    <div className="product-review-avater-thumb">
                      <span className="tp-user-login-avater">{(item?.userName || "U").charAt(0).toUpperCase()}</span>
                    </div>
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
                        <a key={idx} href={url} target="_blank" rel="noreferrer" className="tp-btn-border" style={{ fontSize: 12, padding: "4px 10px" }}>
                          {lang === "tr" ? "Medya" : "Media"} {idx + 1}
                        </a>
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

            {totalPages > 1 && (
              <div className="d-flex gap-2 mb-40">
                <button type="button" className="tp-btn-border" disabled={page <= 0} onClick={() => setPage((p) => Math.max(p - 1, 0))}>
                  {lang === "tr" ? "Önceki" : "Prev"}
                </button>
                <button type="button" className="tp-btn-border" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                  {lang === "tr" ? "Sonraki" : "Next"}
                </button>
              </div>
            )}

            <div className="product-review-form">
              <h3 className="product-review-form-title">{lang === "tr" ? "Yorum Ekle" : "Add a Review"}</h3>
              <p>{lang === "tr" ? "Yorumunuz moderasyon sonrası yayınlanır." : "Your review is published after moderation."}</p>

              <form onSubmit={submitReview} className="row">
                <div className="col-12 mb-20">
                  <label className="mb-2 d-block">{lang === "tr" ? "Puan" : "Rating"}</label>
                  <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="form-control">
                    {[5, 4, 3, 2, 1].map((v) => (
                      <option key={v} value={v}>{v} / 5</option>
                    ))}
                  </select>
                </div>

                <div className="col-12 mb-20">
                  <input type="text" className="form-control" placeholder={lang === "tr" ? "Başlık (opsiyonel)" : "Title (optional)"} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
                </div>

                <div className="col-12 mb-20">
                  <textarea className="form-control" rows={5} placeholder={lang === "tr" ? "Yorumunuz" : "Your comment"} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={2000} required></textarea>
                </div>

                <div className="col-12 mb-25">
                  <textarea className="form-control" rows={3} placeholder={lang === "tr" ? "Medya URL'leri (satır satır, opsiyonel)" : "Media URLs (one per line, optional)"} value={mediaRaw} onChange={(e) => setMediaRaw(e.target.value)} />
                </div>

                <div className="col-12">
                  <button type="submit" className="tp-btn" disabled={createLoading}>
                    {createLoading ? (lang === "tr" ? "Gönderiliyor..." : "Submitting...") : (lang === "tr" ? "Yorumu Gönder" : "Submit Review")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsReviewsLive;

"use client";
import React, { useEffect, useState } from "react";
import PrdDetailsDescription from "./prd-details-description";
import PrdDetailsTabNav from "./prd-details-tab-nav";
import ProductDetailsReviewsLive from "./product-details-reviews-live";

const ProductDetailsTabArea = ({ product, initialTab = null }) => {
  const normalizedTab = (initialTab || "").toLowerCase();
  const [activeTab, setActiveTab] = useState(
    normalizedTab === "reviews" || normalizedTab === "review" ? "reviews" : "description"
  );

  useEffect(() => {
    let rafId = null;
    const scrollReviewsIntoView = () => {
      const attempt = () => {
        const reviewsPane = document.getElementById("nav-reviews");
        if (!reviewsPane) {
          rafId = window.requestAnimationFrame(attempt);
          return;
        }
        reviewsPane.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      rafId = window.requestAnimationFrame(attempt);
    };

    const openReviewsIfRequested = () => {
      const hash = window.location.hash;
      const queryTab = new URLSearchParams(window.location.search).get("tab");
      const shouldOpenReviews =
        hash === "#reviews" || queryTab === "reviews" || queryTab === "review";
      if (!shouldOpenReviews) {
        return;
      }
      setActiveTab("reviews");
      scrollReviewsIntoView();
    };

    const handleOpenReviewsEvent = () => openReviewsIfRequested();
    window.addEventListener("hashchange", handleOpenReviewsEvent);
    window.addEventListener("product:open-reviews", handleOpenReviewsEvent);
    openReviewsIfRequested();

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("hashchange", handleOpenReviewsEvent);
      window.removeEventListener("product:open-reviews", handleOpenReviewsEvent);
    };
  }, []);

  return (
    <section className="product__details-tab-area pb-110">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="product__details-tab-nav">
              {/* nav tab */}
              <PrdDetailsTabNav activeTab={activeTab} onTabChange={setActiveTab} />
              {/* nav tab */}
            </div>
            <div className="product__details-tab-content">
              <div className="tab-content" id="nav-tabContent-info">
                <div
                  className={`tab-pane ${activeTab === "description" ? "active" : ""}`}
                  id="nav-desc"
                  style={{ display: activeTab === "description" ? "block" : "none" }}
                >
                  <PrdDetailsDescription product={product} />
                </div>
                <div
                  className={`tab-pane ${activeTab === "reviews" ? "active" : ""}`}
                  id="nav-reviews"
                  style={{ display: activeTab === "reviews" ? "block" : "none" }}
                >
                  <ProductDetailsReviewsLive productId={product?._id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsTabArea;

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
    const shouldOpenReviews = window.location.hash === "#reviews";
    if (shouldOpenReviews) {
      setActiveTab("reviews");
      const reviewsPane = document.getElementById("nav-reviews");
      reviewsPane?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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

"use client";
import React, { useState } from "react";
import PrdDetailsDescription from "./prd-details-description";
import PrdDetailsTabNav from "./prd-details-tab-nav";
import ProductDetailsReviewsLive from "./product-details-reviews-live";

const ProductDetailsTabArea = ({product}) => {
  const [activeTab, setActiveTab] = useState("description");

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

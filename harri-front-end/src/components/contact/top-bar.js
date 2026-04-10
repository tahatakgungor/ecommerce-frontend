import React from "react";
// internal
const TopBar = ({title,subtitle}) => {
  return (
    <section className="tp-section-area p-relative z-index-1 tp-section-spacing">
      <div
        className="tp-section-bg"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}
      ></div>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-8">
            <div className="tp-section-wrapper-2 text-center">
              <span className="tp-section-subtitle-2 subtitle-mb-9">
                {title}
              </span>
              <h3 className="tp-section-title-2 font-70">
                {subtitle}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopBar;

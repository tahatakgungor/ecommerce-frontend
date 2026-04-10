import React from "react";
// internal
const SectionTop = ({ title, subtitle }) => {
  return (
    <section className="tp-section-area p-relative z-index-1 tp-section-spacing">
      <div
        className="tp-section-bg"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}
      ></div>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-7 col-lg-8">
            <div className="tp-section-wrapper-2 text-center">
              <h3 className="tp-section-title-2 font-70">{title}</h3>
              <p>{subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionTop;

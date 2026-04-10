import React from "react";
const AboutTopBar = () => {
  return (
    <section
      className="about__heading about__heading-overlay about__spacing"
      style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-8 col-lg-10">
            <div className="about__heading-content text-center p-relative z-index-1">
              <span className="about__heading-subtitle">About us</span>
              <h3 className="about__heading-title">
              Serravit Doğal Sağlık Ürünleri
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutTopBar;

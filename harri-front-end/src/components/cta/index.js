'use client';
import { useLanguage } from "src/context/LanguageContext";

const ShopCta = () => {
  const { lang } = useLanguage();
  const isTr = lang === "tr";

  const handleSubmit = e => {
    e.preventDefault();
  }
  return (
    <section className="cta__area pt-50 pb-50 p-relative">
      <div className="container">
        <div className="cta__inner-13 white-bg">
          <div className="row align-items-center">
            <div className="col-xl-6 col-lg-6">
              <div className="cta__content-13">
                <h3 className="cta__title-13">
                  {isTr
                    ? <>Son Kampanya &amp; <br /> Fırsatlardan Haberdar Ol</>
                    : <>Subscribe for <br /> Latest Trends &amp; Offers</>}
                </h3>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6">
              <div className="cta__form-13">
                <form onSubmit={handleSubmit}>
                  <div className="cta__input-13">
                    <input type="email" placeholder={isTr ? "E-posta adresiniz" : "Enter Your Email"} />
                    <button type="submit" className="tp-btn">
                      {isTr ? "Abone Ol" : "Subscribe"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopCta;

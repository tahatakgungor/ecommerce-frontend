'use client';
import { useState } from "react";
import { useLanguage } from "src/context/LanguageContext";
import { useSubscribeNewsletterMutation } from "src/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@utils/toast";

const ShopCta = () => {
  const { lang } = useLanguage();
  const isTr = lang === "tr";
  const [email, setEmail] = useState("");
  const [subscribeNewsletter, { isLoading: isSubscribing }] = useSubscribeNewsletterMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await subscribeNewsletter({ email }).unwrap();
      notifySuccess(res?.message || (isTr ? "Bülten aboneliği başarılı." : "Newsletter subscription successful."));
      setEmail("");
    } catch (err) {
      notifyError(err?.data?.message || (isTr ? "Abonelik sırasında hata oluştu." : "Subscription failed."));
    }
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
                  <div className="cta__input-13 cta__input-13--responsive">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isTr ? "E-posta adresiniz" : "Enter Your Email"}
                      required
                    />
                    <button type="submit" className="tp-btn cta__submit-13" disabled={isSubscribing}>
                      {isSubscribing
                        ? (isTr ? "Gönderiliyor..." : "Sending...")
                        : (isTr ? "Abone Ol" : "Subscribe")}
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

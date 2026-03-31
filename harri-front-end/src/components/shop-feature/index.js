'use client';
// internal
import {Payment, Refund, ShippingCar, Support} from "@svg/index";
import { useLanguage } from "src/context/LanguageContext";

// SingleFeature
function SingleFeature({ icon, title, subtitle }) {
  return (
    <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
      <div className="features__item-13 d-flex align-items-start mb-40">
        <div className="features__icon-13">
          <span>{icon}</span>
        </div>
        <div className="features__content-13">
          <h3 className="features__title-13">{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

const ShopFeature = () => {
  const { lang } = useLanguage();
  const isTr = lang === "tr";
  return (
    <>
      <section className="features__area pt-80 pb-20">
        <div className="container">
          <div className="row">
            <SingleFeature
              icon={<ShippingCar />}
              title={isTr ? "Ücretsiz Kargo" : "Free Shipping"}
              subtitle={
                <>
                  {isTr ? <>400₺ üzeri siparişlerde <br /> ücretsiz kargo</> : <>Free Shipping for orders <br /> over ₺400</>}
                </>
              }
            />
            <SingleFeature
              icon={<Refund/>}
              title={isTr ? "İade" : "Refund"}
              subtitle={
                <>
                  {isTr ? <>30 gün içinde <br /> iade veya değişim</> : <>Within 30 days for an <br /> exchange.</>}
                </>
              }
            />
            <SingleFeature
              icon={<Support />}
              title={isTr ? "Destek" : "Support"}
              subtitle={
                <>
                  {isTr ? <>Haftanın 7 günü <br /> 24 saat destek</> : <>24 hours a day, 7 days <br /> a week</>}
                </>
              }
            />
            <SingleFeature
              icon={<Payment />}
              title={isTr ? "Ödeme" : "Payment"}
              subtitle={
                <>
                  {isTr ? <>Kredi kartı ile <br /> güvenli ödeme</> : <>Pay with Multiple Credit <br /> Cards</>}
                </>
              }
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopFeature;

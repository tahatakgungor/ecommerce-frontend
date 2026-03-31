'use client';
// internal
import ContactForm from "@components/forms/contact-form";
import { useLanguage } from "src/context/LanguageContext";

const FormArea = () => {
  const { t } = useLanguage();
  return (
    <section className={`contact__form-area pt-90`}>
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="contact__form-2">
              <h3 className="contact__form-2-title">{t('sendMessageTitle')}</h3>
              {/* form start */}
              <ContactForm/>
              {/* form end */}
              <p className="ajax-response"></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FormArea;

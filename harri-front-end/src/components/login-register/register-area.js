'use client';
import Link from "next/link";
// internal
import RegisterForm from "@components/forms/register-form";
import { useLanguage } from "src/context/LanguageContext";

const RegisterArea = () => {
  const { t } = useLanguage();
  return (
    <section className="login__area pt-110 pb-110">
      <div className="container">
        <div className="login__inner p-relative z-index-1">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8 col-md-10">
              <div className="login__wrapper">
                <div className="login__top mb-30 text-center">
                  <h3 className="login__title">{t('registerTitle')}</h3>
                </div>
                <div className="login__form">
                  {/* register form start */}
                  <RegisterForm/>
                  {/* register form end */}
                  <div className="login__register-now">
                    <p>
                      {t('hasAccount')} <Link href="/login">{t('signIn')}</Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegisterArea;

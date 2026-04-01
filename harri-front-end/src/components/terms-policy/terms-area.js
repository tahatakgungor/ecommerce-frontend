import Link from "next/link";

const TermsArea = () => {
  return (
    <section className="policy__area pb-120">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="policy__wrapper policy__translate p-relative z-index-1">
              <div className="policy__item mb-35">
                <h4 className="policy__meta">
                  Son güncelleme: 18 Eylül 2022
                </h4>
                <p>
                  Bunlar, bu Hizmeti yönetişim Hükümleri ve Koşulları ve Sizinle
                  Şirket arasındaki sözleşmedir. Bu Hükümler ve Koşullar,
                  Hizmetin kullanımına ilişkin tüm kullanıcıların hak ve
                  yükümlülüklerini belirler. Hizmete erişiminiz ve
                  kullanımınız, bu Hükümler ve Koşulları kabul etmenize ve
                  bunlara uymanıza bağlıdır. Bu Hükümler ve Koşullar, Hizmet'e
                  erişen veya kullanan tüm ziyaretçiler, kullanıcılar ve diğer
                  kişiler için geçerlidir.
                </p>
                <p>
                  Hizmetlere herhangi bir şekilde erişerek veya kullanarak, bu
                  Gizlilik Politikası'nda belirtilen uygulamaları ve politikaları
                  kabul ettiğinizi onaylıyor ve Serravit'in bilgilerinizi
                  aşağıdaki şekillerde toplamasına, kullanmasına ve paylaşmasına
                  rıza gösteriyorsunuz. Hizmetlerin kullanımının her zaman bu
                  Gizlilik Politikası'nı kapsayan Şartlar'a tabi olduğunu
                  unutmayın.
                </p>
              </div>

              <div className="policy__item policy__item-2 mb-35">
                <h3 className="policy__title">Tanımlar</h3>
                <p>
                  İlk harfi büyük yazılan kelimelerin aşağıdaki koşullar
                  kapsamında tanımlanmış anlamları vardır. Aşağıdaki tanımlar,
                  tekil veya çoğul olarak kullanılmalarından bağımsız olarak
                  aynı anlama sahip olacaktır.
                </p>
              </div>

              <div className="policy__list mb-35">
                <h3 className="policy__title">
                  Bu Hükümler ve Koşulların Amaçları:
                </h3>
                <ul>
                  <li>
                    <strong>İştirak</strong>; bir tarafı kontrol eden, tarafından
                    kontrol edilen veya ortak kontrol altında bulunan bir
                    kuruluş anlamına gelir.
                  </li>
                  <li>
                    <strong>Ülke</strong>: Türkiye
                  </li>
                  <li>
                    <strong>Şirket</strong> (bu Sözleşmede &quot;Şirket&quot;,
                    &quot;Biz&quot;, &quot;Bize&quot; veya &quot;Bizim&quot;
                    olarak anılır) Serravit Doğal Sağlık Ürünleri anlamına gelir.
                  </li>
                  <li>
                    <strong>Cihaz</strong>; bilgisayar, cep telefonu veya dijital
                    tablet gibi Hizmete erişebilen herhangi bir cihaz anlamına
                    gelir.
                  </li>
                  <li>
                    <strong>Hizmet</strong>, Web Sitesi'ni ifade eder.
                  </li>
                  <li>
                    <strong>Web Sitesi</strong>, erişilebilen Serravit'i ifade
                    eder:{" "}
                    <Link
                      href="/"
                      rel="external nofollow noopener"
                      target="_blank"
                    >
                      serravit.com
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="policy__contact">
                <h3 className="policy__title policy__title-2">Bize Ulaşın</h3>
                <p>Bize istediğiniz zaman ulaşabilirsiniz:</p>

                <ul>
                  <li>
                    E-posta:{" "}
                    <span>
                      <a href="mailto:destek@serravit.com">destek@serravit.com</a>
                    </span>
                  </li>
                </ul>

                <div className="policy__address">
                  <p>
                    Serravit Doğal Sağlık Ürünleri <br /> Türkiye
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsArea;


const PolicyArea = () => {
  return (
    <section className="policy__area pb-120">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="policy__wrapper policy__translate p-relative z-index-1">
              <div className="policy__item mb-35">
                <h4 className="policy__meta">Effective date: May 25, 2023</h4>
                <p>
                  Serravit, kişisel bilgilerinizin nasıl kullanıldığı ve
                  paylaşıldığı konusundaki hassasiyetinizin farkındadır ve
                  gizliliğinizi ciddiye almaktadır. Serravit Gizlilik Politikası
                  ("Gizlilik Politikası") hakkında daha fazla bilgi edinmek için
                  lütfen aşağıdakileri okuyun. Bu Gizlilik Politikası ayrıca
                  haklarınız ve seçimleriniz ile iletişim bilgilerinizi
                  güncellemek veya gizlilik uygulamalarımız hakkında sorularınıza
                  yanıt almak için bize nasıl ulaşabileceğiniz hakkında bilgi
                  verir.
                </p>
                <p>
                  Hizmetlere herhangi bir şekilde erişerek veya kullanarak, bu
                  Gizlilik Politikası'nda belirtilen uygulamaları ve politikaları
                  kabul ettiğinizi onaylıyor ve Serravit'in bilgilerinizi
                  aşağıdaki şekillerde toplamasına, kullanmasına ve paylaşmasına
                  rıza gösteriyorsunuz. Hizmetlerin kullanımınızın her zaman bu
                  Gizlilik Politikası'nı kapsayan Şartlar'a tabi olduğunu
                  unutmayın. Serravit'in bu Gizlilik Politikası'nda tanımlamadan
                  kullandığı tüm terimler, Şartlar'da kendilerine verilen
                  tanımlara sahiptir.
                </p>
              </div>

              <div className="policy__item policy__item-2 mb-35">
                <h3 className="policy__title">Bilgi Toplama</h3>
                <p>
                  Kişisel Bilgilerinizi ifşa etmeden web sitemizi ziyaret edebilir
                  ve kullanabilirsiniz. Ancak Hizmetin düzgün çalışması için
                  belirli Kişisel Bilgileri bizimle paylaşmanız gerekecektir.
                </p>

                <p>
                  Bu Gizlilik Politikası'nın amaçları doğrultusunda, "Kişisel
                  Bilgiler"; belirli bir tüketici, cihaz veya hane ile doğrudan
                  veya dolaylı olarak makul ölçüde ilişkilendirilebilen bilgiler
                  anlamına gelir. Kimliği gizlenmiş veya toplu bilgileri ya da
                  devlet kayıtlarından yasal olarak erişilebilen kamuya açık
                  bilgileri kapsamaz.
                </p>
              </div>

              <div className="policy__list mb-35">
                <h3 className="policy__title">Kişisel Bilgilerin Kullanımı</h3>
                <ul>
                  <li>Hizmeti sağlamak ve sürdürmek;</li>
                  <li>Teknik sorunları tespit etmek, önlemek ve çözmek;</li>
                  <li>
                    Sizi kullanıcı olarak kaydetmek ve talep ettiğiniz
                    hizmetleri sunmak;
                  </li>
                  <li>Hizmetimizdeki değişiklikler hakkında sizi bilgilendirmek;</li>
                  <li>Müşteri desteği ve yardım sağlamak;</li>
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

export default PolicyArea;

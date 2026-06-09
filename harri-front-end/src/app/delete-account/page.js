import Footer from "@layout/footer";
import Header from "@layout/header";
import Wrapper from "@layout/wrapper";
import SectionTop from "@components/terms-policy/section-top-bar";

const supportEmail = "destek@serravit.com";
const requestMailto = `mailto:${supportEmail}?subject=${encodeURIComponent("Serravit Hesap Silme Talebi")}`;

export const metadata = {
  title: "Hesap Silme Talebi - Serravit",
  description: "Serravit hesabını uygulama dışında da silme talebi oluşturabilmen için yönlendirme sayfası.",
};

export default function DeleteAccountPage() {
  return (
    <Wrapper>
      <Header style_2={true} />
      <SectionTop
        title="Hesap Silme Talebi"
        subtitle="Serravit hesabını uygulama dışından silmek istersen bu sayfa üzerinden talep oluşturabilirsin."
      />

      <section className="policy__area pb-120">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10">
              <div className="policy__wrapper policy__translate p-relative z-index-1">
                <div className="policy__item mb-35">
                  <h4 className="policy__meta">Harici hesap silme bağlantısı</h4>
                  <p>
                    Bu sayfa Google Play için gerekli olan uygulama dışı hesap silme talep kaynağı olarak yayınlanır.
                    Serravit mobil uygulamasında hesap oluşturduysan aşağıdaki yöntemlerden biriyle kalıcı silme talebi
                    başlatabilirsin.
                  </p>
                </div>

                <div className="policy__item policy__item-2 mb-35">
                  <h3 className="policy__title">1. Uygulama içinden doğrudan sil</h3>
                  <p>
                    En hızlı yol mobil uygulamadaki <strong>Hesabım &gt; Ayarlar &gt; Hesabı Sil</strong> akışıdır.
                    Bu işlem sipariş geçmişi, değerlendirmeler, favoriler, kayıtlı adresler ve ilişkili hesap verilerini
                    kalıcı olarak siler.
                  </p>
                </div>

                <div className="policy__item policy__item-2 mb-35">
                  <h3 className="policy__title">2. Web üzerinden talep oluştur</h3>
                  <p>
                    Uygulamaya erişimin yoksa destek ekibine kayıtlı e-posta adresinle talep gönderebilirsin.
                  </p>
                  <div className="policy__list mb-0">
                    <ul>
                      <li>Konu satırına “Serravit Hesap Silme Talebi” yaz.</li>
                      <li>Hesabında kullandığın e-posta adresini belirt.</li>
                      <li>Mümkünse telefon numaranı veya son sipariş numaranı ekle.</li>
                    </ul>
                  </div>
                  <p style={{ marginTop: 18 }}>
                    <a className="tp-btn tp-btn-border" href={requestMailto}>
                      E-posta ile Talep Gönder
                    </a>
                  </p>
                </div>

                <div className="policy__contact">
                  <h3 className="policy__title policy__title-2">İletişim</h3>
                  <p>
                    Hesap silme talebinle ilgili ek doğrulama gerekirse destek ekibimiz sana dönüş yapar.
                  </p>
                  <ul>
                    <li>
                      E-mail:{" "}
                      <span>
                        <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
                      </span>
                    </li>
                    <li>
                      Gizlilik Politikası:{" "}
                      <span>
                        <a href="/policy">serravit.com/policy</a>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </Wrapper>
  );
}

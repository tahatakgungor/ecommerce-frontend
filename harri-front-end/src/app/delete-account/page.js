import Footer from "@layout/footer";
import Header from "@layout/header";
import Wrapper from "@layout/wrapper";
import SectionTop from "@components/terms-policy/section-top-bar";
import LegalPageHub from "@components/terms-policy/legal-page-hub";

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

      <section className="policy__area policy__area--serravit pb-120">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10">
              <div className="policy__wrapper policy__translate p-relative z-index-1">
                <LegalPageHub current="delete-account" />

                <div className="policy__item mb-35">
                  <h4 className="policy__meta">Harici hesap silme bağlantısı</h4>
                  <p>
                    Bu sayfa Google Play için gerekli olan uygulama dışı hesap silme talep kaynağı olarak yayınlanır.
                    Serravit mobil uygulamasında hesap oluşturduysan aşağıdaki yöntemlerden biriyle kalıcı silme talebi
                    başlatabilirsin.
                  </p>
                </div>

                <div className="policy__step-grid mb-35">
                  <article className="policy__step-card">
                    <span className="policy__step-number">1</span>
                    <h3 className="policy__title">Uygulama içinden doğrudan sil</h3>
                    <p>
                      En hızlı yol mobil uygulamadaki <strong>Hesabım &gt; Ayarlar &gt; Hesabı Sil</strong> akışıdır.
                    </p>
                    <div className="policy__list mb-0">
                      <ul>
                        <li>Mevcut şifren doğrulanır.</li>
                        <li>Hesabınla ilişkili veriler kalıcı olarak temizlenir.</li>
                        <li>Aktif oturum kapatılır ve erişim sonlandırılır.</li>
                      </ul>
                    </div>
                  </article>

                  <article className="policy__step-card">
                    <span className="policy__step-number">2</span>
                    <h3 className="policy__title">Web üzerinden talep oluştur</h3>
                    <p>
                      Uygulamaya erişimin yoksa destek ekibine, hesabında kayıtlı e-posta adresinle talep gönderebilirsin.
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
                  </article>
                </div>

                <div className="policy__notice mb-35">
                  <strong>Güvenlik notu:</strong> Yetkisiz silme taleplerini önlemek için destek ekibimiz ek doğrulama isteyebilir.
                </div>

                <div className="policy__contact">
                  <h3 className="policy__title policy__title-2">İletişim</h3>
                  <p>
                    Hesap silme talebinle ilgili ek doğrulama gerekirse destek ekibimiz sana dönüş yapar.
                  </p>
                  <ul className="policy__contact-list">
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

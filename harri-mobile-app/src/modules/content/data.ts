export const supportHubCards = [
  {
    id: "faq",
    title: "Sıkça Sorulan Sorular",
    description: "Sipariş, ödeme, kupon ve iade süreçlerini hızlı cevaplarla görün.",
    route: "/faq",
  },
  {
    id: "contact",
    title: "İletişim",
    description: "Destek ekibine mesaj bırakın veya doğrudan iletişim kanallarını kullanın.",
    route: "/contact",
  },
  {
    id: "about",
    title: "Serravit Hakkında",
    description: "Marka vaadi, ürün yaklaşımı ve deneyim ilkelerini okuyun.",
    route: "/about",
  },
  {
    id: "policy",
    title: "Gizlilik Politikası",
    description: "Veri işleme, saklama ve güvenlik prensiplerinin özetini görün.",
    route: "/policy",
  },
  {
    id: "terms",
    title: "Kullanım Koşulları",
    description: "Sipariş, hesap ve içerik kullanım koşulları tek ekranda.",
    route: "/terms",
  },
  {
    id: "blog",
    title: "Blog",
    description: "Ürün kullanımı, kategori rehberleri ve içerik odaklı keşif yazıları.",
    route: "/blog",
  },
] as const;

export const aboutContent = {
  eyebrow: "DOĞAL SAĞLIK YAKLAŞIMI",
  title: "Ürün, destek ve güveni aynı çizgide tutan marka modeli",
  intro:
    "Serravit mobil deneyimi sadece ürün listeleyen bir katalog değil; sipariş öncesi rehberlik, sipariş sonrası destek ve güvenli hesap yönetimi sunan tam bir commerce yüzeyi olarak tasarlanıyor.",
  pillars: [
    {
      title: "İçerik netliği",
      body: "Ürün detayları, kullanım notları ve kampanya koşulları yoruma açık kalmayacak kadar açık olmalı.",
    },
    {
      title: "Operasyon görünürlüğü",
      body: "Sipariş, kargo, kupon ve destek adımları kullanıcıdan saklanmadan tek akışta görülebilmeli.",
    },
    {
      title: "Güvenli süreç",
      body: "Oturum, ödeme ve veri hareketleri performans kadar güvenlik sertliğiyle ele alınmalı.",
    },
  ],
  faqs: [
    {
      title: "Neden mobile parity önemli?",
      body: "Kullanıcı siparişinin her aşamasını telefonda yönetebilmelidir; web'e dönme zorunluluğu güven ve dönüşümü düşürür.",
    },
    {
      title: "Bu altyapı sadece bu markaya mı bağlı?",
      body: "Hayır. Domain, kategori ve içerik blokları config tabanlı kurulduğu için başka markalara veya dikeylere uyarlanabilir.",
    },
  ],
};

export const faqSections = [
  {
    title: "Sipariş ve Teslimat",
    items: [
      {
        title: "Siparişim ne zaman kargoya verilir?",
        body: "Ödemesi onaylanan siparişler genellikle 1-3 iş günü içinde hazırlanır. Kampanya dönemlerinde yoğunluğa göre süre uzayabilir.",
      },
      {
        title: "Kargo sürecini nasıl takip ederim?",
        body: "Sipariş kargoya verildiğinde e-posta ile bilgilendirme gönderilir. Takip numarasıyla kargo firmasının sisteminden anlık durum görülebilir.",
      },
      {
        title: "Aynı siparişte birden fazla ürün alabilir miyim?",
        body: "Evet. Sepetinize farklı kategorilerden ürün ekleyebilir ve stok uygunsa tek ödemede tamamlayabilirsiniz.",
      },
    ],
  },
  {
    title: "Ürün, Kupon ve Ödeme",
    items: [
      {
        title: "Kupon kodunu nasıl kullanırım?",
        body: "Checkout ekranındaki kupon alanından kodu uygulayabilirsiniz. Koşullar sağlanmıyorsa sistem sebebini gösterecek şekilde tasarlandı.",
      },
      {
        title: "Ödeme sırasında hata alırsam ne yapmalıyım?",
        body: "Kart bilgilerini kontrol edip tekrar deneyin. Sorun devam ederse destek ekibine sipariş bilginizle ulaşın.",
      },
      {
        title: "Kupon neden sadece hesabımda görünüyor?",
        body: "Bazı kampanyalar belirli müşterilere özel tanımlanır. Bu, kişiselleştirme ve suistimali azaltma amacıyla kullanılır.",
      },
    ],
  },
  {
    title: "Hesap ve İade",
    items: [
      {
        title: "Hesap bilgilerimi nereden güncelleyebilirim?",
        body: "Profil ayarları ekranından ad, iletişim ve kayıtlı adreslerinizi güncelleyebilirsiniz.",
      },
      {
        title: "İade veya iptal talebini nasıl iletirim?",
        body: "Destek merkezi ve sipariş akışlarından destek ekibine ulaşabilirsiniz. Talep, ürün durumu ve mevzuata göre değerlendirilir.",
      },
    ],
  },
];

export const privacyPolicyContent = {
  title: "Gizlilik Politikası",
  subtitle:
    "Serravit, ziyaretçi ve müşterilerinin kişisel verilerini dikkatle korur. Bu sayfa hangi verilerin neden işlendiğini ve temel haklarınızı özetler.",
  effectiveDate: "Yürürlük tarihi: 9 Nisan 2026",
  sections: [
    {
      title: "Toplanan veriler",
      paragraphs: [
        "Hesap oluşturma ve sipariş sürecinde ad-soyad, e-posta, telefon, teslimat adresi ve işlem detayları gibi veriler işlenebilir.",
        "Hizmet kalitesi ve güvenlik için cihaz, tarayıcı, IP ve oturum gibi teknik veriler toplanabilir.",
      ],
    },
    {
      title: "İşleme amaçları",
      bullets: [
        "Siparişleri oluşturmak, hazırlamak, sevk etmek ve teslim etmek",
        "Ödeme doğrulama ve dolandırıcılık önleme kontrolleri yapmak",
        "Destek taleplerini yanıtlamak ve operasyonel bildirim göndermek",
        "Yasal yükümlülükleri yerine getirmek",
      ],
    },
    {
      title: "Paylaşım ve güvenlik",
      paragraphs: [
        "Veriler yalnızca ödeme, lojistik, teknik altyapı ve yasal uyumluluk için gerekli taraflarla paylaşılır.",
        "Yetkisiz erişimi azaltmak için teknik ve idari kontroller düzenli olarak uygulanır.",
      ],
    },
  ],
  contactEmail: "destek@serravit.com",
};

export const termsContent = {
  title: "Kullanım Koşulları",
  subtitle: "Bu koşullar, Serravit storefront'unu ziyaret eden veya alışveriş yapan kullanıcılar için temel kuralları tanımlar.",
  effectiveDate: "Son güncelleme: 9 Nisan 2026",
  sections: [
    {
      title: "Genel kullanım",
      paragraphs: [
        "Siteyi kullanarak bu koşulları kabul etmiş sayılırsınız. Hizmet hukuka aykırı veya sisteme zarar verecek biçimde kullanılamaz.",
        "Ürün, fiyat, stok ve kampanya bilgileri operasyonel gerekliliklere göre güncellenebilir.",
      ],
    },
    {
      title: "Sipariş ve ödeme",
      bullets: [
        "Siparişler stok durumu ve ödeme onayına bağlıdır.",
        "Fiyat, kargo ve kampanya kuralları checkout'ta gösterilen nihai tutara göre uygulanır.",
        "Güvenlik riski veya şüpheli işlem görülürse sipariş ek doğrulamaya alınabilir.",
      ],
    },
    {
      title: "Hesap ve içerik sorumluluğu",
      paragraphs: [
        "Hesap bilgilerinizin doğruluğu ve hesabınız üzerinden yapılan işlemlerden siz sorumlusunuz.",
        "Metin, görsel ve marka unsurları fikri mülkiyet koruması altındadır.",
      ],
    },
  ],
  contactEmail: "destek@serravit.com",
};

export const contactChannels = [
  {
    title: "E-posta",
    value: "destek@serravit.com",
    hint: "Sipariş, ödeme, kupon ve hesap soruları için",
  },
  {
    title: "WhatsApp",
    value: "+90 555 000 00 00",
    hint: "Hızlı destek ve sipariş sonrası yönlendirme için",
  },
  {
    title: "Çalışma düzeni",
    value: "Hafta içi 09:00 - 18:00",
    hint: "Mesajlara öncelik sırasına göre dönüş yapılır",
  },
] as const;

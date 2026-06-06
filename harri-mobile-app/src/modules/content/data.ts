export const supportHubCards = [
  {
    id: "faq",
    title: "Sikca Sorulan Sorular",
    description: "Siparis, odeme, kupon ve iade sureclerini hizli cevaplarla gorun.",
    route: "/faq",
  },
  {
    id: "contact",
    title: "Iletisim",
    description: "Destek ekibine mesaj birakin veya dogrudan iletisim kanallarini kullanin.",
    route: "/contact",
  },
  {
    id: "about",
    title: "Serravit Hakkinda",
    description: "Marka vaadi, urun yaklasimi ve deneyim ilkelerini okuyun.",
    route: "/about",
  },
  {
    id: "policy",
    title: "Gizlilik Politikasi",
    description: "Veri isleme, saklama ve guvenlik prensiplerinin ozetini gorun.",
    route: "/policy",
  },
  {
    id: "terms",
    title: "Kullanim Kosullari",
    description: "Siparis, hesap ve icerik kullanim kosullari tek ekranda.",
    route: "/terms",
  },
  {
    id: "blog",
    title: "Blog",
    description: "Urun kullanimi, kategori rehberleri ve icerik odakli kesif yazilari.",
    route: "/blog",
  },
] as const;

export const aboutContent = {
  eyebrow: "DOGAL SAGLIK YAKLASIMI",
  title: "Urun, destek ve guveni ayni cizgide tutan marka modeli",
  intro:
    "Serravit mobil deneyimi sadece urun listeleyen bir katalog degil; siparis oncesi rehberlik, siparis sonrasi destek ve guvenli hesap yonetimi sunan tam bir commerce yuzeyi olarak tasarlaniyor.",
  pillars: [
    {
      title: "Icerik netligi",
      body: "Urun detaylari, kullanim notlari ve kampanya kosullari yoruma acik kalmayacak kadar acik olmali.",
    },
    {
      title: "Operasyon gorunurlugu",
      body: "Siparis, kargo, kupon ve destek adimlari kullanicidan saklanmadan tek akista gorulebilmeli.",
    },
    {
      title: "Guvenli surec",
      body: "Oturum, odeme ve veri hareketleri performans kadar guvenlik sertligiyle ele alinmali.",
    },
  ],
  faqs: [
    {
      title: "Neden mobile parity onemli?",
      body: "Kullanici siparisinin her asamasini telefonda yonetebilmelidir; web'e donme zorunlulugu guven ve donusumu dusurur.",
    },
    {
      title: "Bu altyapi sadece bu markaya mi bagli?",
      body: "Hayir. Domain, kategori ve icerik bloklari config tabanli kuruldugu icin baska markalara veya dikeylere uyarlanabilir.",
    },
  ],
};

export const faqSections = [
  {
    title: "Siparis ve Teslimat",
    items: [
      {
        title: "Siparisim ne zaman kargoya verilir?",
        body: "Odemesi onaylanan siparisler genellikle 1-3 is gunu icinde hazirlanir. Kampanya donemlerinde yogunluga gore sure uzayabilir.",
      },
      {
        title: "Kargo surecini nasil takip ederim?",
        body: "Siparis kargoya verildiginde e-posta ile bilgilendirme gonderilir. Takip numarasiyla kargo firmasinin sisteminden anlik durum gorulebilir.",
      },
      {
        title: "Ayni sipariste birden fazla urun alabilir miyim?",
        body: "Evet. Sepetinize farkli kategorilerden urun ekleyebilir ve stok uygunsa tek odemede tamamlayabilirsiniz.",
      },
    ],
  },
  {
    title: "Urun, Kupon ve Odeme",
    items: [
      {
        title: "Kupon kodunu nasil kullanirim?",
        body: "Checkout ekranindaki kupon alanindan kodu uygulayabilirsiniz. Kosullar saglanmiyorsa sistem sebebini gosterecek sekilde tasarlandi.",
      },
      {
        title: "Odeme sirasinda hata alirsam ne yapmaliyim?",
        body: "Kart bilgilerini kontrol edip tekrar deneyin. Sorun devam ederse destek ekibine siparis bilginizle ulasin.",
      },
      {
        title: "Kupon neden sadece hesabimda gorunuyor?",
        body: "Bazi kampanyalar belirli musterilere ozel tanimlanir. Bu, kisilestirme ve suistimali azaltma amaciyla kullanilir.",
      },
    ],
  },
  {
    title: "Hesap ve Iade",
    items: [
      {
        title: "Hesap bilgilerimi nereden guncelleyebilirim?",
        body: "Profil ayarlari ekranindan ad, iletisim ve kayitli adreslerinizi guncelleyebilirsiniz.",
      },
      {
        title: "Iade veya iptal talebini nasil iletirim?",
        body: "Destek merkezi ve siparis akislarindan destek ekibine ulasabilirsiniz. Talep, urun durumu ve mevzuata gore degerlendirilir.",
      },
    ],
  },
];

export const privacyPolicyContent = {
  title: "Gizlilik Politikasi",
  subtitle:
    "Serravit, ziyaretci ve musterilerinin kisisel verilerini dikkatle korur. Bu sayfa hangi verilerin neden islendigini ve temel haklarinizi ozetler.",
  effectiveDate: "Yururluk tarihi: 9 Nisan 2026",
  sections: [
    {
      title: "Toplanan veriler",
      paragraphs: [
        "Hesap olusturma ve siparis surecinde ad-soyad, e-posta, telefon, teslimat adresi ve islem detaylari gibi veriler islenebilir.",
        "Hizmet kalitesi ve guvenlik icin cihaz, tarayici, IP ve oturum gibi teknik veriler toplanabilir.",
      ],
    },
    {
      title: "Isleme amaclari",
      bullets: [
        "Siparisleri olusturmak, hazirlamak, sevk etmek ve teslim etmek",
        "Odeme dogrulama ve dolandiricilik onleme kontrolleri yapmak",
        "Destek taleplerini yanitlamak ve operasyonel bildirim gondermek",
        "Yasal yukumlulukleri yerine getirmek",
      ],
    },
    {
      title: "Paylasim ve guvenlik",
      paragraphs: [
        "Veriler yalnizca odeme, lojistik, teknik altyapi ve yasal uyumluluk icin gerekli taraflarla paylasilir.",
        "Yetkisiz erisimi azaltmak icin teknik ve idari kontroller duzenli olarak uygulanir.",
      ],
    },
  ],
  contactEmail: "destek@serravit.com",
};

export const termsContent = {
  title: "Kullanim Kosullari",
  subtitle: "Bu kosullar, Serravit storefront'unu ziyaret eden veya alisveris yapan kullanicilar icin temel kurallari tanimlar.",
  effectiveDate: "Son guncelleme: 9 Nisan 2026",
  sections: [
    {
      title: "Genel kullanim",
      paragraphs: [
        "Siteyi kullanarak bu kosullari kabul etmis sayilirsiniz. Hizmet hukuka aykiri veya sisteme zarar verecek bicimde kullanilamaz.",
        "Urun, fiyat, stok ve kampanya bilgileri operasyonel gerekliliklere gore guncellenebilir.",
      ],
    },
    {
      title: "Siparis ve odeme",
      bullets: [
        "Siparisler stok durumu ve odeme onayina baglidir.",
        "Fiyat, kargo ve kampanya kurallari checkout'ta gosterilen nihai tutara gore uygulanir.",
        "Guvenlik riski veya supheli islem gorulurse siparis ek dogrulamaya alinabilir.",
      ],
    },
    {
      title: "Hesap ve icerik sorumlulugu",
      paragraphs: [
        "Hesap bilgilerinizin dogrulugu ve hesabiniz uzerinden yapilan islemlerden siz sorumlusunuz.",
        "Metin, gorsel ve marka unsurlari fikri mulkiyet korumasi altindadir.",
      ],
    },
  ],
  contactEmail: "destek@serravit.com",
};

export const contactChannels = [
  {
    title: "E-posta",
    value: "destek@serravit.com",
    hint: "Siparis, odeme, kupon ve hesap sorulari icin",
  },
  {
    title: "WhatsApp",
    value: "+90 555 000 00 00",
    hint: "Hizli destek ve siparis sonrasi yonlendirme icin",
  },
  {
    title: "Calisma duzeni",
    value: "Hafta ici 09:00 - 18:00",
    hint: "Mesajlara oncelik sirasina gore donus yapilir",
  },
] as const;

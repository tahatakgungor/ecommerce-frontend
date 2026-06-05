import type { CommerceTenant } from "@/domain/types";

export const serravitTenant: CommerceTenant = {
  id: "serravit",
  brandName: "Serravit",
  industry: "Dogal saglik urunleri",
  tagline: "Dogal takviyeler icin hizli ve guvenli mobil alisveris",
  heroTitle: "Performansli mobil commerce altyapisi",
  heroDescription:
    "Bugunku storefrontu mobil-first deneyime tasirken katalog, siparis ve marka katmanlarini daha sonra farkli sektorler icin yeniden kullanilabilir hale getiriyoruz.",
  palette: {
    primary: "#1f7a44",
    primarySoft: "#edf8f1",
    accent: "#c56c2d",
    background: "#f4f7f3",
    surface: "#ffffff",
    border: "#d8e5d8",
    text: "#122017",
    mutedText: "#5f6e63",
  },
  promises: [
    "Ayni backend ile mobil katalog ve siparis akisi",
    "Tenant bazli marka ve tema ayrimi",
    "Buyuk trafik altinda cache ve API katmani ile olceklenme",
  ],
  mobileSections: [
    {
      title: "Catalog Core",
      description: "Katalog, filtre ve detay sorgulari mobil performansa gore ayrisir.",
    },
    {
      title: "Checkout Hardening",
      description: "Odeme ve auth akislari native container senaryolarina gore sertlestirilir.",
    },
    {
      title: "Tenant Packs",
      description: "Marka, yazi tonu, kategori semasi ve ana sayfa bloklari config tabanli olur.",
    },
  ],
};

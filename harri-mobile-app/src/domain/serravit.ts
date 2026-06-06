import type { CommerceTenant } from "@/domain/types";

export const serravitTenant: CommerceTenant = {
  id: "serravit",
  brandName: "Serravit",
  industry: "Doğal sağlık ürünleri",
  tagline: "Doğal takviyeler için hızlı ve güvenli mobil alışveriş",
  apiBaseUrl: "https://api.serravit.com",
  heroTitle: "Performanslı mobil commerce altyapısı",
  heroDescription:
    "Bugünkü storefrontu mobil-first deneyime taşırken katalog, sipariş ve marka katmanlarını daha sonra farklı sektörler için yeniden kullanılabilir hale getiriyoruz.",
  palette: {
    primary: "#167c49",
    primarySoft: "#e3f4ec",
    accent: "#f07b24",
    background: "#f4f7fb",
    surface: "#ffffff",
    border: "#dbe4ec",
    text: "#162117",
    mutedText: "#60707a",
  },
  promises: [
    "Aynı backend ile mobil katalog ve sipariş akışı",
    "Tenant bazlı marka ve tema ayrımı",
    "Büyük trafik altında cache ve API katmanı ile ölçeklenme",
  ],
  mobileSections: [
    {
      title: "Catalog Core",
      description: "Katalog, filtre ve detay sorguları mobil performansa göre ayrışır.",
    },
    {
      title: "Checkout Hardening",
      description: "Ödeme ve auth akışları native container senaryolarına göre sertleştirilir.",
    },
    {
      title: "Tenant Packs",
      description: "Marka, yazı tonu, kategori şeması ve ana sayfa blokları config tabanlı olur.",
    },
  ],
};

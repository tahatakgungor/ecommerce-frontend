'use client';

import Link from "next/link";
import { useLanguage } from "src/context/LanguageContext";

const LegalPageHub = ({ current }) => {
  const { lang } = useLanguage();

  const items = [
    {
      key: "policy",
      href: "/policy",
      title: lang === "tr" ? "Gizlilik Politikası" : "Privacy Policy",
      description: lang === "tr"
        ? "Kişisel verilerin nasıl işlendiğini ve korunduğunu inceleyin."
        : "Review how personal data is processed and protected.",
    },
    {
      key: "terms",
      href: "/terms",
      title: lang === "tr" ? "Kullanım Koşulları" : "Terms and Conditions",
      description: lang === "tr"
        ? "Sipariş, ödeme ve site kullanım kurallarını görün."
        : "See the core rules for orders, payments, and site usage.",
    },
    {
      key: "delete-account",
      href: "/delete-account",
      title: lang === "tr" ? "Hesap Silme" : "Delete Account",
      description: lang === "tr"
        ? "Uygulama dışı hesap silme talebi ve doğrulama adımları."
        : "External account deletion request and verification steps.",
    },
  ];

  return (
    <div className="policy__hub">
      {items.map((item) => {
        const isActive = item.key === current;
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`policy__hub-card${isActive ? " is-active" : ""}`}
          >
            <span className="policy__hub-label">
              {isActive
                ? (lang === "tr" ? "Bu sayfadasın" : "Current page")
                : (lang === "tr" ? "Hızlı erişim" : "Quick access")}
            </span>
            <strong>{item.title}</strong>
            <span>{item.description}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default LegalPageHub;

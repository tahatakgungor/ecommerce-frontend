'use client';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { notifyError, notifySuccess } from "@utils/toast";
import { useLanguage } from "src/context/LanguageContext";

const ProductShareSheet = ({ productId, title, className = "product-action-btn" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const wrapperRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    const updateScreen = () => setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    updateScreen();
    window.addEventListener("resize", updateScreen);
    return () => window.removeEventListener("resize", updateScreen);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/product-details/${productId}`;
  }, [productId]);

  const shareText = `${title || ""} ${shareUrl}`.trim();

  const copyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      notifySuccess(t("linkCopied"));
      setIsOpen(false);
    } catch (error) {
      notifyError(t("somethingWentWrong"));
    }
  };

  const openWhatsApp = () => {
    if (!shareUrl) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  const openEmail = () => {
    if (!shareUrl) return;
    window.location.href = `mailto:?subject=${encodeURIComponent(title || "SERRAVİT Ürünü")}&body=${encodeURIComponent(shareText)}`;
    setIsOpen(false);
  };

  const options = [
    { key: "whatsapp", label: t("shareOnWhatsApp"), onClick: openWhatsApp, icon: "fa-brands fa-whatsapp" },
    { key: "email", label: t("shareWithEmail"), onClick: openEmail, icon: "fa-regular fa-envelope" },
    { key: "copy", label: t("copyLink"), onClick: copyLink, icon: "fa-regular fa-link" },
  ];

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <button
        type="button"
        className={className}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={t("share")}
      >
        <i className="fa-regular fa-share-nodes"></i>
        <span className="product-action-tooltip">{t("share")}</span>
      </button>

      {isOpen && !isMobile && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            minWidth: 220,
            border: "1px solid #e5e7eb",
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 12px 24px rgba(15, 23, 42, 0.16)",
            zIndex: 40,
            padding: 8,
          }}
        >
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={option.onClick}
              style={{
                width: "100%",
                border: "none",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                textAlign: "left",
              }}
            >
              <i className={option.icon}></i>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && isMobile && (
        <>
          <div
            role="presentation"
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              zIndex: 998,
            }}
          />
          <div
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              background: "#fff",
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              padding: "16px 14px 20px",
              zIndex: 999,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>{t("share")}</div>
            <div style={{ display: "grid", gap: 8 }}>
              {options.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={option.onClick}
                  style={{
                    width: "100%",
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 10,
                    textAlign: "left",
                  }}
                >
                  <i className={option.icon}></i>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                width: "100%",
                marginTop: 10,
                border: "none",
                background: "#f3f4f6",
                color: "#111827",
                padding: "12px 14px",
                borderRadius: 10,
                fontWeight: 600,
              }}
            >
              {t("cancelAction")}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductShareSheet;

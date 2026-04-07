"use client";
import { useEffect, useRef } from "react";

const IyzicoCheckoutModal = ({ checkoutFormContent, onClose }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!checkoutFormContent || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = checkoutFormContent;

    // innerHTML <script> tag'lerini çalıştırmaz — yeniden oluştur
    const scripts = container.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });

    return () => {
      container.innerHTML = "";
    };
  }, [checkoutFormContent]);

  if (!checkoutFormContent) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: "24px 16px 16px",
          maxWidth: 500,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Kapat"
          style={{
            position: "absolute",
            top: 8,
            right: 12,
            fontSize: 22,
            background: "none",
            border: "none",
            cursor: "pointer",
            lineHeight: 1,
            color: "#555",
          }}
        >
          ×
        </button>
        <div ref={containerRef} />
      </div>
    </div>
  );
};

export default IyzicoCheckoutModal;

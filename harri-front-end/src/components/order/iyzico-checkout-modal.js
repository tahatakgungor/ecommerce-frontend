"use client";
import { useEffect, useRef } from "react";

const IyzicoCheckoutModal = ({ checkoutFormContent, onClose }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!checkoutFormContent || !containerRef.current) return;

    // Force inline (responsive) instead of popup if Iyzico returns popup mode
    const formContent = checkoutFormContent.replace(/class="popup"/g, 'class="responsive"');

    const container = containerRef.current;
    container.innerHTML = formContent;

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

  const handleClose = () => {
    if (window.confirm("Ödemeyi iptal etmek istediğinize emin misiniz?")) {
      onClose();
    }
  };

  return (
    <div ref={containerRef} className="iyzico-inline-form-wrapper" />
  );
};

export default IyzicoCheckoutModal;

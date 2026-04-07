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

  // Iyzico "iyzico ile Öde" and "Popup" modes automatically generate a full screen
  // overlay on the document.body. We just need to give it an invisible DOM anchor to execute its script.
  return (
    <div ref={containerRef} style={{ display: 'none' }} />
  );
};

export default IyzicoCheckoutModal;

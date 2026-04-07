"use client";
import { useEffect, useRef } from "react";

const IyzicoCheckoutModal = ({ checkoutFormContent, onClose }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!checkoutFormContent || !iframeRef.current) return;

    const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; background: transparent; font-family: sans-serif; }
            /* Iyzico injects an overlay, we let it fill the iframe */
          </style>
        </head>
        <body>
          ${checkoutFormContent}
        </body>
      </html>
    `);
    iframeDoc.close();

  }, [checkoutFormContent]);

  if (!checkoutFormContent) return null;

  return (
    <iframe
      ref={iframeRef}
      style={{
        width: "100%",
        height: "850px", // Large enough to avoid internal scrolling for 3D secure and wallets
        border: "none",
        background: "transparent",
        overflow: "hidden"
      }}
      title="Iyzico Secure Payment"
    />
  );
};

export default IyzicoCheckoutModal;

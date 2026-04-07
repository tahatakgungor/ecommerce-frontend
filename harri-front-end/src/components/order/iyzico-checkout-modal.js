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
            /* Reset the iframe body */
            body, html { 
              margin: 0; padding: 0; 
              background: transparent !important; 
              font-family: sans-serif; 
              height: 100%;
            }
            
            /* Target Iyzico's injected wrapper and overlay */
            body > div {
              background: transparent !important;
              position: relative !important;
              display: block !important;
            }
            
            /* Hide the X button forcefully */
            [class*="close" i], [id*="close" i] {
              display: none !important;
            }
            
            /* Make overlays transparent */
            [class*="overlay" i], [class*="backdrop" i] {
              background: transparent !important;
              box-shadow: none !important;
            }
            
            /* Force the modal content box to fill the entire iframe */
            body > div > div {
              background: transparent !important;
              box-shadow: none !important;
              max-width: 100% !important;
              width: 100% !important;
              height: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              border-radius: 8px !important;
              transform: none !important;
              top: 0 !important;
              left: 0 !important;
            }

            /* Ensure Iyzico's internal iframe fills the space */
            iframe {
              width: 100% !important;
              height: 100% !important;
              border: none !important;
              border-radius: 8px !important;
            }
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

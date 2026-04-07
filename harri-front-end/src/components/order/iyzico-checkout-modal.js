"use client";
import { useEffect, useRef } from "react";

const IyzicoCheckoutModal = ({ checkoutFormContent, onClose }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!checkoutFormContent || !iframeRef.current) return;

    const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
    if (!iframeDoc) return;

    // Reset iframe to clear any previous state
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            body, html { 
              margin: 0; padding: 0; 
              background: #fff !important; 
              font-family: 'Syne', sans-serif; 
              overflow-x: hidden;
            }
            
            /* Aggressively strip Iyzico's popup/overlay wrapper */
            #iyzipay-checkout-form {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            /* Hide the close button in ALL known Iyzico versions */
            [class*="close" i], [id*="close" i], .iyzi-close, .iyzi-p-close {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              pointer-events: none !important;
            }
            
            /* Remove shadows and backdrops to make it feel naturally flat */
            [class*="overlay" i], [class*="backdrop" i], [class*="modal" style*="fixed"] {
              background: transparent !important;
              box-shadow: none !important;
              position: relative !important;
              top: 0 !important;
              left: 0 !important;
              transform: none !important;
            }

            /* Force the internal modal box to occupy 100% of the iframe */
            body > div, body > div > div {
              position: relative !important;
              top: 0 !important;
              left: 0 !important;
              transform: none !important;
              width: 100% !important;
              max-width: 100% !important;
              box-shadow: none !important;
              margin: 0 !important;
              border: none !important;
            }

            /* Fix for sandbox Ribbon if visible */
            .iyzipay-sandbox-header {
              position: sticky !important;
              top: 0;
              z-index: 100;
            }
          </style>
        </head>
        <body>
          <div id="iyzipay-checkout-form" class="responsive">
            ${checkoutFormContent}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

  }, [checkoutFormContent]);

  if (!checkoutFormContent) return null;

  return (
    <div className="iyzico-iframe-wrapper" style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        style={{
          width: "100%",
          height: "1250px",
          border: "none",
          background: "transparent",
          display: "block"
        }}
        scrolling="no"
        title="Secure Payment"
      />
    </div>
  );
};

export default IyzicoCheckoutModal;

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
              height: auto !important;
            }
            
            #iyzipay-checkout-form {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            /* Strip Iyzico popup UI */
            [class*="close" i], [id*="close" i], .iyzi-close, .iyzi-p-close {
              display: none !important;
            }
            
            [class*="overlay" i], [class*="backdrop" i], [class*="modal" style*="fixed"] {
              background: transparent !important;
              box-shadow: none !important;
              position: relative !important;
              top: 0 !important;
              left: 0 !important;
              transform: none !important;
            }

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

            .iyzipay-sandbox-header {
              position: sticky !important;
              top: 0;
              z-index: 100;
            }
          </style>
          <script>
            // Monitor content height changes and notify parent
            window.addEventListener('load', () => {
              const notifyHeight = () => {
                const height = document.documentElement.scrollHeight || document.body.scrollHeight;
                window.parent.postMessage({ type: 'iyzico_resize', height: height }, '*');
              };

              // Use ResizeObserver for instant response to installment expansions
              const observer = new ResizeObserver(notifyHeight);
              observer.observe(document.body);
              
              // Fallback for async content loads
              notifyHeight();
              setTimeout(notifyHeight, 1000);
              setTimeout(notifyHeight, 3000);
            });
          </script>
        </head>
        <body>
          <div id="iyzipay-checkout-form" class="responsive">
            ${checkoutFormContent}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    // Parent side listener for height messages
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'iyzico_resize') {
        const height = event.data.height;
        if (iframeRef.current && height > 0) {
          iframeRef.current.style.height = (height + 20) + "px";
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);

  }, [checkoutFormContent]);

  if (!checkoutFormContent) return null;

  return (
    <div className="iyzico-iframe-wrapper" style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        style={{
          width: "100%",
          height: "600px", // Initial height
          border: "none",
          background: "transparent",
          display: "block",
          transition: "height 0.3s ease" // Smooth transition when installments expand
        }}
        scrolling="no"
        title="Secure Payment"
      />
    </div>
  );
};

export default IyzicoCheckoutModal;

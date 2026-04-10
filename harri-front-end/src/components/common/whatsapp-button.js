'use client';
import { useGetSiteSettingsQuery } from "src/redux/features/siteSettingsApi";

const WhatsAppButton = () => {
  const { data: siteSettings } = useGetSiteSettingsQuery();
  const rawNumber = siteSettings?.whatsappNumber || "905322254155";
  const number = rawNumber.replace(/\D+/g, "");
  const message = encodeURIComponent("Merhaba! Serravit ürünleri hakkında bilgi almak istiyorum.");
  const url = `https://wa.me/${number}?text=${message}`;

  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="wp-float-btn"
        aria-label="WhatsApp ile iletişime geç"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28" fill="#fff">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 2.82.737 5.47 2.027 7.773L0 32l8.464-2.002A15.93 15.93 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 0 1-6.77-1.848l-.487-.29-5.025 1.188 1.215-4.887-.318-.503A13.266 13.266 0 0 1 2.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.273-9.94c-.398-.199-2.354-1.162-2.72-1.294-.365-.133-.631-.199-.897.199-.266.398-1.03 1.294-1.263 1.56-.232.265-.465.298-.863.1-.398-.2-1.682-.62-3.203-1.977-1.184-1.056-1.983-2.36-2.215-2.758-.232-.398-.025-.613.174-.811.179-.178.398-.465.597-.698.199-.232.265-.398.398-.664.133-.265.066-.498-.033-.697-.1-.199-.897-2.163-1.23-2.96-.323-.777-.651-.672-.897-.684l-.764-.013c-.266 0-.698.1-1.063.498-.365.398-1.396 1.363-1.396 3.327s1.43 3.86 1.629 4.126c.199.265 2.814 4.298 6.82 6.027.954.411 1.698.657 2.279.841.957.305 1.828.262 2.516.159.767-.115 2.354-.963 2.687-1.893.333-.93.333-1.727.233-1.893-.1-.166-.365-.265-.763-.464z"/>
        </svg>
      </a>
      <style jsx>{`
        .wp-float-btn {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9999;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #25d366;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(37, 211, 102, 0.45);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .wp-float-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 22px rgba(37, 211, 102, 0.6);
        }
      `}</style>
    </>
  );
};

export default WhatsAppButton;

"use client";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import 'dayjs/locale/tr';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.locale('tr');
dayjs.extend(relativeTime);
import {
  PRODUCT_IMAGE_FALLBACK,
  buildImageErrorFallbackHandler,
  isExternalMediaUrl,
} from "src/utils/media-url";
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { useLanguage } from "src/context/LanguageContext";
import { getOrderStatusMeta, getReturnStatusMeta } from "src/utils/order-status";
import ProductRatingSummary from "@components/products/product-rating-summary";
import { getFullName } from "src/utils/user-name";

/** Kargo firmasına göre takip URL'i döndürür */
function getCarrierTrackingUrl(carrier, trackingNumber) {
  const c = (carrier || "").toLowerCase().trim();
  const no = encodeURIComponent(trackingNumber || "");
  if (c.includes("aras")) return `https://kargotakip.araskargo.com.tr/mainpage.aspx?code=${no}`;
  if (c.includes("yurtiçi") || c.includes("yurtici")) return `https://www.yurticikargo.com/tr/online-islemler/gonderi-sorgula?code=${no}`;
  if (c.includes("mng")) return `https://www.mngkargo.com.tr/gonderi-sorgula?code=${no}`;
  if (c.includes("ptt")) return `https://www.ptt.gov.tr/tr/gonderi-sorgula?barcode=${no}`;
  if (c.includes("sürat") || c.includes("surat")) return `https://www.suratkargo.com.tr/KargoTakip/Index?code=${no}`;
  if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${no}`;
  if (c.includes("dhl")) return `https://www.dhl.com/tr-tr/home/tracking.html?tracking-id=${no}`;
  // Bilinmeyen firma için Google'da ara
  return `https://www.google.com/search?q=${encodeURIComponent((carrier || "") + " " + (trackingNumber || "") + " kargo takip")}`;
}

export default function InvoiceArea({ innerRef, info, onOpenReviewModal }) {
    const { name, firstName, lastName, country, city, contact, invoice, createdAt, cart, cardInfo, paymentMethod, status, shippingCost, discount, totalAmount, shippingCarrier, trackingNumber, shippedAt, returnStatus } = info || {};
    const { t, lang } = useLanguage();
    const customerFullName = getFullName({ name, firstName, lastName });
    const orderItems = Array.isArray(cart) ? cart : [];
    const paymentType = paymentMethod || cardInfo?.type || "-";
    const discountSafe = Number(discount || 0);
    const statusMeta = getOrderStatusMeta(status, lang);
    const returnMeta = returnStatus ? getReturnStatusMeta(returnStatus, lang) : null;
    const displayStatusMeta = returnMeta
      ? {
          label: returnMeta.label,
          desc: returnMeta.desc,
          tone: returnMeta.tone === "danger" ? "danger" : (returnMeta.tone === "success" ? "success" : "warning"),
        }
      : statusMeta;
    const isDelivered = String(status || "").toLowerCase() === "delivered";
    const firstReviewableProductId = orderItems.find((item) => item?._id)?._id;
  return (
    <div ref={innerRef} className="invoice__wrapper grey-bg-15 pt-40 pb-40 pl-40 pr-40 tp-invoice-print-wrapper">
      {/* <!-- invoice header --> */}
      <div className="invoice__header-wrapper border-2 border-bottom border-white mb-40">
        <div className="row">
          <div className="col-xl-12">
            <div className="invoice__header pb-20">
              <div className="row align-items-end">
                <div className="col-md-4 col-sm-6">
                  <div className="invoice__left">
                    <Image className="mb-15" priority src="/assets/img/logo/logo-black.svg" alt="logo" width={112} height={42} />
                    <p>
                      Serravit Doğal Sağlık Ürünleri
                    </p>
                  </div>
                </div>
                <div className="col-md-8 col-sm-6">
                  <div className="invoice__right mt-15 mt-sm-0 text-sm-end">
                    <h3 className="text-uppercase font-70 mb-20">{t('invoiceTitle')}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <!-- invoice customer details --> */}
      <div className="invoice__customer mb-30">
        <div className="row">
          <div className="col-md-6 col-sm-8">
            <div className="invoice__customer-details">
              <h4 className="mb-10 text-uppercase">{customerFullName}</h4>
              <p className="mb-0 text-uppercase">{country}</p>
              <p className="mb-0 text-uppercase">{city}</p>
              <p className="mb-0">{contact}</p>
            </div>
          </div>
          <div className="col-md-6 col-sm-4">
            <div className="invoice__details mt-md-0 mt-20 text-md-end">
              <p className="mb-0">
                <strong>{t('invoiceId')}</strong> #{invoice}
              </p>
              <p className="mb-0">
                <strong>{t('date')}</strong> {dayjs(createdAt).format("D MMMM YYYY HH:mm")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`alert alert-${displayStatusMeta.tone} d-flex flex-wrap align-items-center justify-content-between mb-30`}
        style={{ gap: 12 }}
      >
        <div>
          <strong style={{ display: "block" }}>{lang === "tr" ? "Sipariş Durumu" : "Order Status"}: {displayStatusMeta.label}</strong>
          <span style={{ fontSize: 14 }}>{displayStatusMeta.desc}</span>
        </div>
        <span style={{ fontSize: 13, opacity: 0.9 }}>
          {lang === "tr" ? "Son Güncelleme" : "Last Update"}: {dayjs(createdAt).format("D MMMM YYYY HH:mm")}
        </span>
      </div>

      {returnMeta && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap",
          background: returnMeta.bg, border: `1px solid ${returnMeta.border}`,
          borderRadius: 10, padding: "12px 16px", marginBottom: 24,
        }}>
          <div style={{ flex: 1 }}>
            <strong style={{ display: "block", fontSize: 13, color: returnMeta.color, marginBottom: 3 }}>
              ↩ {lang === "tr" ? "İade Durumu" : "Return Status"}: {returnMeta.label}
            </strong>
            <span style={{ fontSize: 13, color: returnMeta.color, opacity: 0.85 }}>{returnMeta.desc}</span>
          </div>
        </div>
      )}

      {isDelivered && !returnMeta && (
        <div
          style={{
            marginBottom: 24,
            borderRadius: 12,
            border: "1px solid #bbf7d0",
            background: "linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)",
            padding: "14px 16px",
          }}
        >
          <strong style={{ display: "block", fontSize: 14, color: "#166534", marginBottom: 4 }}>
            {lang === "tr" ? "Siparişiniz teslim edildi. Ürünü değerlendirebilirsiniz." : "Your order is delivered. You can review the product."}
          </strong>
          <span style={{ display: "block", fontSize: 13, color: "#166534", opacity: 0.9, marginBottom: 10 }}>
            {lang === "tr"
              ? "Değerlendirme bağlantısı e-posta adresinize de gönderilir."
              : "A review link is also sent to your email address."}
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {firstReviewableProductId && (
              onOpenReviewModal ? (
                <button
                  type="button"
                  className="tp-btn"
                  onClick={() => onOpenReviewModal()}
                  style={{
                    minHeight: 34,
                    borderRadius: 999,
                    padding: "0 14px",
                    display: "inline-flex",
                    alignItems: "center",
                    border: "none",
                  }}
                >
                  {lang === "tr" ? "Ürünü Değerlendir" : "Review Product"}
                </button>
              ) : (
                <Link
                  href={`/product-details/${firstReviewableProductId}?tab=reviews#reviews`}
                  className="tp-btn"
                  style={{ minHeight: 34, borderRadius: 999, padding: "0 14px", display: "inline-flex", alignItems: "center" }}
                >
                  {lang === "tr" ? "Ürünü Değerlendir" : "Review Product"}
                </Link>
              )
            )}
          </div>
        </div>
      )}

      {/* Kargo Takip Bilgisi */}
      {(status === "shipped" || status === "delivered") && trackingNumber && (
        <div
          style={{
            background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
            border: "1px solid #c4b5fd",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 30,
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <span style={{ fontSize: 28 }}>📦</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#5b21b6", marginBottom: 4 }}>
                {lang === "tr" ? "Kargoya Verildi" : "Order Shipped"} — {shippingCarrier}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#7c3aed", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                {trackingNumber}
              </div>
              {shippedAt && (
                <div style={{ fontSize: 11, color: "#8b5cf6", marginTop: 2 }}>
                  {lang === "tr" ? "Gönderim:" : "Shipped:"} {dayjs(shippedAt).format("D MMMM YYYY HH:mm")}
                </div>
              )}
            </div>
          </div>
          <a
            href={getCarrierTrackingUrl(shippingCarrier, trackingNumber)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#7c3aed",
              color: "white",
              padding: "10px 18px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            {lang === "tr" ? "Kargomu Takip Et" : "Track My Order"} →
          </a>
        </div>
      )}

      <div className="invoice__order-table tp-invoice-mobile-table pt-30 pb-30 pl-40 pr-40 bg-white  mb-30">
        <Table className="table responsiveTable">
          <Thead className="table-light">
            <Tr>
              <Th scope="col">{t('sl')}</Th>
              <Th scope="col">{t('productName')}</Th>
              <Th scope="col">{t('quantity')}</Th>
              <Th scope="col">{t('itemPrice')}</Th>
              <Th scope="col">{t('amount')}</Th>
            </Tr>
          </Thead>
          <Tbody className="table-group-divider">
            {orderItems.map((item, i) => {
              const netPrice = Number.isFinite(Number(item?.price))
                ? Number(item.price)
                : (item?.discount
                    ? item.originalPrice - (item.originalPrice * item.discount) / 100
                    : item.originalPrice);
              return (
              <Tr key={i}>
                <Td>{i + 1}</Td>
                <Td>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ flexShrink: 0 }}>
                      <Image
                        src={item?.image || item?.relatedImages?.[0] || PRODUCT_IMAGE_FALLBACK}
                        alt={item?.title || "product"}
                        width={52}
                        height={52}
                        unoptimized={isExternalMediaUrl(item?.image || item?.relatedImages?.[0] || PRODUCT_IMAGE_FALLBACK)}
                        onError={buildImageErrorFallbackHandler(PRODUCT_IMAGE_FALLBACK)}
                        style={{ borderRadius: 8, objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      {item?._id ? (
                        <Link href={`/product-details/${item._id}`} style={{ fontWeight: 600 }}>
                          {item.title}
                        </Link>
                      ) : (
                        <span>{item?.title}</span>
                      )}
                    </div>
                  </div>
                  {item?._id && (
                    <div style={{ marginTop: 6 }}>
                      <ProductRatingSummary productId={item._id} compact className="tp-rating-summary--card" />
                    </div>
                  )}
                </Td>
                <Td>{item.orderQuantity}</Td>
                <Td>₺{Number(netPrice || 0).toFixed(2)}</Td>
                <Td>₺{Number((netPrice || 0) * (item.orderQuantity || 0)).toFixed(2)}</Td>
              </Tr>
              );
            })}
          </Tbody>
        </Table>
      </div>

      {/* <!-- invoice total --> */}
      <div className="invoice__total pt-40 pb-10 alert-success pl-40 pr-40 mb-30">
        <div className="row">
          <div className="col-lg-3 col-md-4">
            <div className="invoice__payment-method mb-30">
              <h5 className="mb-0">{t('paymentMethod')}</h5>
              <p className="tp-font-medium text-uppercase">{paymentType}</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-4">
            <div className="invoice__shippint-cost mb-30">
              <h5 className="mb-0">{t('shippingCost')}</h5>
              <p className="tp-font-medium">₺{shippingCost}</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-4">
            <div className="invoice__discount-cost mb-30">
              <h5 className="mb-0">{t('discount')}</h5>
              <p className="tp-font-medium">₺{discountSafe.toFixed(2)}</p>
            </div>
          </div>
          <div className="col-lg-3 col-md-4">
            <div className="invoice__total-ammount mb-30">
              <h5 className="mb-0">{t('totalAmount')}</h5>
              <p className="tp-font-medium text-danger">
                <strong>₺{totalAmount}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

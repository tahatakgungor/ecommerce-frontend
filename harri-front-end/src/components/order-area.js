"use client";
import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
// internal
import Loader from "@components/loader/loader";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import {
  useCreateOrderReturnMutation,
  useGetMyOrderReturnsQuery,
  useGetUserOrderByIdQuery,
} from "src/redux/features/orderApi";
import { useLookupOrderQuery } from "src/redux/features/order/orderApi";
import ErrorMessage from "@components/error-message/error";
import InvoiceArea from "./invoice-area";
import { useLanguage } from "src/context/LanguageContext";
import { notifyError, notifySuccess } from "@utils/toast";
import { getReturnStatusMeta } from "src/utils/order-status";

const SingleOrderArea = ({ orderId }) => {
  const contentRef = useRef(null);
  const searchParams = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  const isAuthenticated = Boolean(user?.email);
  const invoice = searchParams.get("invoice")?.trim() || "";
  const email = searchParams.get("email")?.trim() || "";
  const hasGuestLookupCredentials = Boolean(invoice && email);
  const [returnReason, setReturnReason] = useState("");
  const [returnNote, setReturnNote] = useState("");
  const [createReturn, { isLoading: isCreatingReturn }] = useCreateOrderReturnMutation();

  const {
    data: authOrderData,
    isError: authOrderError,
    isLoading: authOrderLoading,
  } = useGetUserOrderByIdQuery(orderId, {
    skip: !isAuthenticated || hasGuestLookupCredentials,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const {
    data: guestLookupData,
    isError: guestLookupError,
    isLoading: guestLookupLoading,
  } = useLookupOrderQuery(
    { invoice, email },
    {
      skip: !hasGuestLookupCredentials,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  const { data: myReturns, refetch: refetchReturns } = useGetMyOrderReturnsQuery(undefined, {
    skip: !isAuthenticated,
  });

  const { t, lang } = useLanguage();
  const authOrderPayload = authOrderData?.order;
  const guestOrderPayload =
    guestLookupData?.order || guestLookupData?.data?.order || guestLookupData?.result?.order;
  const selectedOrder = authOrderPayload || guestOrderPayload;
  const existingReturn = useMemo(() => {
    const list = myReturns?.returns || myReturns?.data?.returns || [];
    return list.find((item) => item?.orderId === selectedOrder?._id);
  }, [myReturns, selectedOrder?._id]);
  const isLoading = hasGuestLookupCredentials
    ? guestLookupLoading
    : (isAuthenticated && authOrderLoading);
  const errorPayload = hasGuestLookupCredentials ? guestLookupError : authOrderError;
  const isError = Boolean(!selectedOrder && errorPayload);
  const errorMessage = errorPayload?.data?.message;

  let content = null;
  if (isLoading) {
    content = (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <Loader loading={isLoading} />
      </div>
    );
  }
  if (!isAuthenticated && !hasGuestLookupCredentials) {
    content = (
      <ErrorMessage
        message={
          lang === "tr"
            ? "Misafir siparişi görüntülemek için fatura numarası ve e-posta doğrulaması gerekli."
            : "Invoice number and email verification are required to view guest orders."
        }
      />
    );
  } else if (isError) {
    content = (
      <ErrorMessage
        message={
          errorMessage ||
          (lang === "tr"
            ? "Sipariş yüklenirken bir hata oluştu. Lütfen linki tekrar açın."
            : "There was an error loading your order. Please reopen the link.")
        }
      />
    );
  } else if (!isLoading && selectedOrder) {
    const {
      _id,
      name,
      country,
      city,
      contact,
      invoice,
      createdAt,
      cart,
      cardInfo,
      paymentMethod,
      status,
      shippingCost,
      discount,
      totalAmount,
      shippingCarrier,
      trackingNumber,
      shippedAt,
    } = selectedOrder;
    content = (
      <section className="invoice__area pt-120 pb-120">
        <div className="container">
          {/* <!-- invoice msg --> */}
          <div className="invoice__msg-wrapper">
            <div className="row">
              <div className="col-xl-12">
                <div className="invoice_msg mb-40">
                  <p className="text-black alert alert-success">
                    {t('thankYouOrder')} <strong>{name}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* invoice area start */}
          <InvoiceArea innerRef={contentRef} info={{_id,name,country,city,contact,invoice,createdAt,cart,cardInfo,paymentMethod,status,shippingCost,discount,totalAmount,shippingCarrier,trackingNumber,shippedAt}} />
          {/* invoice area end */}

          {selectedOrder?.isGuest && (
            <div className="alert alert-info mt-30">
              <p className="mb-2 fw-semibold">
                {lang === "tr" ? "Misafir siparişi görüntülüyorsunuz." : "You are viewing a guest order."}
              </p>
              <p className="mb-3">
                {lang === "tr"
                  ? "Aynı e-posta ile hesap oluşturursanız siparişlerinizi panelinizden daha kolay takip edebilirsiniz."
                  : "Create an account with the same email to track your orders more easily from your dashboard."}
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link
                  href={`/register?email=${encodeURIComponent(email || selectedOrder?.guestEmail || selectedOrder?.email || "")}`}
                  className="tp-btn"
                >
                  {lang === "tr" ? "Hesap Oluştur" : "Create Account"}
                </Link>
                <Link href="/order-lookup" className="tp-btn tp-btn-border">
                  {lang === "tr" ? "Başka Sipariş Sorgula" : "Lookup Another Order"}
                </Link>
              </div>
            </div>
          )}

          {!selectedOrder?.isGuest && String(status || "").toLowerCase() === "delivered" && (
            <div id="return-request" className="mt-30" style={{ border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff", padding: "24px" }}>
              <h5 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                ↩ {t("returnRequest")}
              </h5>

              {existingReturn ? (
                (() => {
                  const meta = getReturnStatusMeta(existingReturn.status, lang);
                  return (
                    <div>
                      <div style={{ marginBottom: 12 }}>
                        <span style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 4 }}>{t("returnStatusLabel")}</span>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "5px 14px", borderRadius: 999,
                          border: `1px solid ${meta.border}`, background: meta.bg,
                          color: meta.color, fontSize: 13, fontWeight: 700,
                        }}>
                          {meta.label}
                        </span>
                      </div>
                      {existingReturn.adminNote && (
                        <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#78350f", marginTop: 8 }}>
                          <strong>{lang === "tr" ? "Ekip Notu:" : "Team Note:"}</strong> {existingReturn.adminNote}
                        </div>
                      )}
                      <p style={{ fontSize: 12, color: "#6b7280", marginTop: 10 }}>{meta.desc}</p>
                    </div>
                  );
                })()
              ) : (
                <>
                  <div className="mb-3">
                    <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>{t("returnReason")} *</label>
                    <select
                      className="form-select"
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      style={{ fontSize: 14 }}
                    >
                      <option value="">{t("returnReasonSelect")}</option>
                      <option value={t("returnReasonDamaged")}>{t("returnReasonDamaged")}</option>
                      <option value={t("returnReasonWrongItem")}>{t("returnReasonWrongItem")}</option>
                      <option value={t("returnReasonSizeIssue")}>{t("returnReasonSizeIssue")}</option>
                      <option value={t("returnReasonChangedMind")}>{t("returnReasonChangedMind")}</option>
                      <option value={t("returnReasonQuality")}>{t("returnReasonQuality")}</option>
                      <option value={t("returnReasonOther")}>{t("returnReasonOther")}</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" }}>{t("returnNote")}</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={returnNote}
                      onChange={(e) => setReturnNote(e.target.value)}
                      placeholder={t("returnNotePlaceholder")}
                      style={{ fontSize: 14, resize: "vertical" }}
                    />
                  </div>
                  <button
                    type="button"
                    className="tp-btn"
                    disabled={!returnReason || isCreatingReturn}
                    style={{ opacity: (!returnReason || isCreatingReturn) ? 0.6 : 1 }}
                    onClick={async () => {
                      try {
                        await createReturn({
                          orderId: selectedOrder._id,
                          reason: returnReason,
                          customerNote: returnNote.trim() || undefined,
                        }).unwrap();
                        notifySuccess(t("returnSuccess"));
                        setReturnReason("");
                        setReturnNote("");
                        refetchReturns();
                      } catch (err) {
                        notifyError(err?.data?.message || (lang === "tr" ? "İade talebi oluşturulamadı." : "Could not create return request."));
                      }
                    }}
                  >
                    {isCreatingReturn
                      ? (lang === "tr" ? "Gönderiliyor..." : "Submitting...")
                      : t("submitReturn")}
                  </button>
                </>
              )}
            </div>
          )}

        </div>
      </section>
    );
  } else if (!isLoading) {
    content = <ErrorMessage message={lang === "tr" ? "Sipariş bulunamadı." : "Order not found."} />;
  }
  return (
    <>
      <Wrapper>
        <Header style_2={true} />
        {/* content */}
        {content}
        {/* content */}
        {/* footer start */}
        <Footer />
        {/* footer end */}
      </Wrapper>
    </>
  );
};

export default SingleOrderArea;

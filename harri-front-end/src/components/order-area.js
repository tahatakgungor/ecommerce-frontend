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
  const { data: myReturns } = useGetMyOrderReturnsQuery(undefined, {
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
            <div className="alert alert-light mt-30" style={{ border: "1px solid #d9eadf" }}>
              <h5 className="mb-2">{lang === "tr" ? "İade Talebi" : "Return Request"}</h5>
              {existingReturn ? (
                <p className="mb-0">
                  {lang === "tr" ? "Mevcut iade durumu" : "Current return status"}:{" "}
                  <strong>{existingReturn.status}</strong>
                </p>
              ) : (
                <>
                  <div className="mb-2">
                    <input
                      className="form-control"
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder={lang === "tr" ? "İade nedeni" : "Return reason"}
                    />
                  </div>
                  <div className="mb-2">
                    <textarea
                      className="form-control"
                      rows={3}
                      value={returnNote}
                      onChange={(e) => setReturnNote(e.target.value)}
                      placeholder={lang === "tr" ? "Ek not (opsiyonel)" : "Optional note"}
                    />
                  </div>
                  <button
                    type="button"
                    className="tp-btn"
                    disabled={!returnReason.trim() || isCreatingReturn}
                    onClick={async () => {
                      try {
                        await createReturn({
                          orderId: selectedOrder._id,
                          reason: returnReason.trim(),
                          customerNote: returnNote.trim() || undefined,
                        }).unwrap();
                        notifySuccess(lang === "tr" ? "İade talebi oluşturuldu." : "Return request created.");
                      } catch (err) {
                        notifyError(err?.data?.message || (lang === "tr" ? "İade talebi oluşturulamadı." : "Could not create return request."));
                      }
                    }}
                  >
                    {isCreatingReturn
                      ? (lang === "tr" ? "Gönderiliyor..." : "Submitting...")
                      : (lang === "tr" ? "İade Talebi Oluştur" : "Create Return Request")}
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

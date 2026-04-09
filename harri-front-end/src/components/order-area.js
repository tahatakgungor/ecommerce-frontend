"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
// internal
import Loader from "@components/loader/loader";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import { useGetUserOrderByIdQuery } from "src/redux/features/orderApi";
import { useLookupOrderQuery } from "src/redux/features/order/orderApi";
import ErrorMessage from "@components/error-message/error";
import InvoiceArea from "./invoice-area";
import { useLanguage } from "src/context/LanguageContext";

const SingleOrderArea = ({ orderId }) => {
  const contentRef = useRef(null);
  const searchParams = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  const isAuthenticated = Boolean(user?.email);
  const invoice = searchParams.get("invoice")?.trim() || "";
  const email = searchParams.get("email")?.trim() || "";
  const hasGuestLookupCredentials = Boolean(invoice && email);

  const {
    data: authOrderData,
    isError: authOrderError,
    isLoading: authOrderLoading,
  } = useGetUserOrderByIdQuery(orderId, {
    skip: !isAuthenticated,
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

  const { t, lang } = useLanguage();
  const authOrderPayload = authOrderData?.order;
  const guestOrderPayload =
    guestLookupData?.order || guestLookupData?.data?.order || guestLookupData?.result?.order;
  const selectedOrder = authOrderPayload || guestOrderPayload;

  const isLoading = !selectedOrder && (
    (!hasGuestLookupCredentials && isAuthenticated && authOrderLoading) ||
    (hasGuestLookupCredentials && (guestLookupLoading || (isAuthenticated && authOrderLoading)))
  );
  const errorPayload = authOrderError || guestLookupError;
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
          <InvoiceArea innerRef={contentRef} info={{_id,name,country,city,contact,invoice,createdAt,cart,cardInfo,status,shippingCost,discount,totalAmount,shippingCarrier,trackingNumber,shippedAt}} />
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

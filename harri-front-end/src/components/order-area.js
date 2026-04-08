"use client";
import React, { useRef } from "react";
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
  const { user, accessToken } = useSelector((state) => state.auth);
  const isAuthenticated = Boolean(user?.email || accessToken);
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
    pollingInterval: 10000,
  });
  const {
    data: guestLookupData,
    isError: guestLookupError,
    isLoading: guestLookupLoading,
  } = useLookupOrderQuery(
    { invoice, email },
    {
      skip: isAuthenticated || !hasGuestLookupCredentials,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      pollingInterval: 15000,
    }
  );

  const { t, lang } = useLanguage();
  const guestOrderPayload =
    guestLookupData?.order || guestLookupData?.data?.order || guestLookupData?.result?.order;
  const selectedOrder = isAuthenticated ? authOrderData?.order : guestOrderPayload;
  const isLoading = isAuthenticated ? authOrderLoading : guestLookupLoading;
  const isError = isAuthenticated ? authOrderError : guestLookupError;

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
    content = <ErrorMessage message="There was an error" />;
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

"use client";
import React, { useRef } from "react";
// internal
import Loader from "@components/loader/loader";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import { useGetUserOrderByIdQuery } from "src/redux/features/orderApi";
import ErrorMessage from "@components/error-message/error";
import InvoiceArea from "./invoice-area";
import { useLanguage } from "src/context/LanguageContext";

const SingleOrderArea = ({ orderId }) => {
  const contentRef = useRef(null);
  const {
    data: order,
    isError,
    isLoading,
  } = useGetUserOrderByIdQuery(orderId, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 10000,
  });
  const { t } = useLanguage();
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
  if (isError) {
    content = <ErrorMessage message="There was an error" />;
  }
  if (!isLoading && !isError) {
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
    } = order.order;
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

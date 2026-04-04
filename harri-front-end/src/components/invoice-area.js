"use client";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { useLanguage } from "src/context/LanguageContext";
import { getOrderStatusMeta } from "src/utils/order-status";

export default function InvoiceArea({innerRef,info}) {
    const { name, country, city, contact, invoice, createdAt, cart, cardInfo, status, shippingCost, discount,totalAmount } = info || {};
    const { t, lang } = useLanguage();
    const orderItems = Array.isArray(cart) ? cart : [];
    const paymentType = cardInfo?.type || "-";
    const discountSafe = Number(discount || 0);
    const statusMeta = getOrderStatusMeta(status, lang);
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
              <h4 className="mb-10 text-uppercase">{name}</h4>
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
                <strong>{t('date')}</strong> {dayjs(createdAt).format("MMMM D, YYYY")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`alert alert-${statusMeta.tone} d-flex flex-wrap align-items-center justify-content-between mb-30`}
        style={{ gap: 12 }}
      >
        <div>
          <strong style={{ display: "block" }}>{lang === "tr" ? "Sipariş Durumu" : "Order Status"}: {statusMeta.label}</strong>
          <span style={{ fontSize: 14 }}>{statusMeta.desc}</span>
        </div>
        <span style={{ fontSize: 13, opacity: 0.9 }}>
          {lang === "tr" ? "Son Güncelleme" : "Last Update"}: {dayjs(createdAt).format("DD MMM YYYY")}
        </span>
      </div>

      {/* <!-- invoice order table --> */}
      <div className="invoice__order-table pt-30 pb-30 pl-40 pr-40 bg-white  mb-30">
        <Table className="table">
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
            {orderItems.map((item, i) => (
              <Tr key={i}>
                <Td>{i + 1}</Td>
                <Td>
                  {item?._id ? (
                    <Link href={`/product-details/${item._id}`} style={{ fontWeight: 600 }}>
                      {item.title}
                    </Link>
                  ) : (
                    <span>{item?.title}</span>
                  )}
                  {status === "delivered" && item?._id && (
                    <div style={{ marginTop: "6px" }}>
                      <Link
                        href={`/product-details/${item._id}?tab=reviews`}
                        className="tp-btn-border"
                        style={{ fontSize: 12, padding: "4px 10px", display: "inline-flex", alignItems: "center" }}
                      >
                        {lang === "tr" ? "Ürünü Değerlendir" : "Review Product"}
                      </Link>
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <span className={`badge bg-${statusMeta.tone}`} style={{ fontSize: 11 }}>
                      {lang === "tr" ? "Kargo Durumu" : "Shipping Status"}: {statusMeta.label}
                    </span>
                  </div>
                </Td>
                <Td>{item.orderQuantity}</Td>
                <Td>
                  ₺
                  {item?.discount
                    ? item.originalPrice -
                      (item.originalPrice * item.discount) / 100
                    : item.originalPrice}
                </Td>
                <Td>
                  ₺
                  {item?.discount
                    ? (item.originalPrice -
                        (item.originalPrice * item.discount) / 100) *
                      item.orderQuantity
                    : item.originalPrice * item.orderQuantity}
                </Td>
              </Tr>
            ))}
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

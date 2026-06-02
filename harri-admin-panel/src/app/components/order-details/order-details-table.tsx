import { Order } from "@/types/order-amount-type";
import dayjs from "dayjs";
import Image from "next/image";
import React from "react";

type IPropType = {
  orderData: Order;
};

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-3 border-b border-gray6 py-3 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <div className="max-w-[60%] text-right text-sm font-medium text-slate-900">{value}</div>
  </div>
);

const InfoCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-md bg-white px-4 py-6 shadow-xs sm:px-8 sm:py-8">
    <h5 className="mb-4 text-lg font-semibold text-slate-900">{title}</h5>
    <div>{children}</div>
  </div>
);

const OrderDetailsTable = ({ orderData }: IPropType) => {
  const paymentMethodLabel = (() => {
    const raw = String(orderData?.paymentMethod || "").trim();
    if (!raw) return "Kart";
    if (raw === "COD") return "Kapıda Ödeme";
    if (raw === "Card") return "Kart";
    return raw;
  })();

  const agreementAcceptedLabel = orderData?.agreementAccepted ? "Kabul Edildi" : "Kabul Edilmedi";
  const agreementAcceptedAtLabel = orderData?.agreementAcceptedAt
    ? dayjs(orderData.agreementAcceptedAt).format("DD.MM.YYYY HH:mm")
    : "-";

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
      <InfoCard title="Müşteri Bilgileri">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-sm text-slate-500">Müşteri</span>
          <div className="flex items-center gap-3 text-right">
            {orderData?.user?.imageURL ? (
              <Image
                className="h-10 w-10 rounded-full object-cover"
                src={orderData.user.imageURL}
                alt="user-img"
                width={40}
                height={40}
              />
            ) : null}
            <span className="font-medium text-slate-900">{orderData?.user?.name || "-"}</span>
          </div>
        </div>
        <DetailRow
          label="E-posta"
          value={
            orderData?.user?.email ? (
              <a href={`mailto:${orderData.user.email}`} className="break-all text-theme hover:underline">
                {orderData.user.email}
              </a>
            ) : (
              "-"
            )
          }
        />
        <DetailRow
          label="Telefon"
          value={
            orderData?.contact ? (
              <a href={`tel:${orderData.contact}`} className="text-theme hover:underline">
                {orderData.contact}
              </a>
            ) : (
              "-"
            )
          }
        />
      </InfoCard>

      <InfoCard title="Sipariş Özeti">
        <DetailRow label="Sipariş Tarihi" value={dayjs(orderData.createdAt).format("DD.MM.YYYY")} />
        <DetailRow label="Kargo Ücreti" value={`₺${Number(orderData?.shippingCost || 0).toFixed(2)}`} />
        <DetailRow label="Ödeme Yöntemi" value={paymentMethodLabel} />
        <DetailRow label="Sözleşme Onayı" value={agreementAcceptedLabel} />
        <DetailRow label="Onay Zamanı" value={agreementAcceptedAtLabel} />
      </InfoCard>

      <InfoCard title="Teslimat Adresi">
        <DetailRow label="Ülke" value={orderData.country || "-"} />
        <DetailRow
          label="Adres"
          value={<span className="whitespace-normal break-words">{orderData.address || "-"}</span>}
        />
        <DetailRow label="Şehir" value={orderData.city || "-"} />
      </InfoCard>
    </div>
  );
};

export default OrderDetailsTable;

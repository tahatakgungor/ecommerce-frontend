'use client';
import React from "react";
import MyOrderItems from "./my-order-items";
import { useLanguage } from "src/context/LanguageContext";

const MyOrders = ({ orderData, filterStatus, setFilterStatus }) => {
  const { t } = useLanguage();
  const all_items = orderData?.orders ?? [];

  const filtered = filterStatus
    ? all_items.filter(o => o.status === filterStatus)
    : all_items;

  const statusLabel = filterStatus === 'pending' ? t('statusPending')
    : filterStatus === 'processing' ? t('statusProcessing')
    : filterStatus === 'delivered' ? t('statusDelivered')
    : null;

  return (
    <div className="profile__ticket table-responsive">
      {filterStatus && (
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span style={{ fontSize: "13px", color: "#6b7280" }}>
            {statusLabel} ({filtered.length})
          </span>
          <button
            onClick={() => setFilterStatus(null)}
            style={{ fontSize: "12px", color: "#6a9a2a", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            {t('totalOrders')} →
          </button>
        </div>
      )}
      {filtered.length === 0 && (
        <div
          style={{ minHeight: "160px", padding: "2rem 0" }}
          className="d-flex align-items-center justify-content-center"
        >
          <div className="text-center">
            <i style={{ fontSize: "30px" }} className="fa-solid fa-cart-circle-xmark"></i>
            <p>{t('noOrdersYet')}</p>
          </div>
        </div>
      )}
      {filtered.length > 0 && (
        <MyOrderItems itemsPerPage={8} items={filtered} />
      )}
    </div>
  );
};

export default MyOrders;

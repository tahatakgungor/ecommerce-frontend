'use client';
import React from "react";
import MyOrderItems from "./my-order-items";
import { useLanguage } from "src/context/LanguageContext";

const MyOrders = ({ orderData, filterStatus, setFilterStatus, reviewOverview, refetchOverview }) => {
  const { t } = useLanguage();
  const all_items = orderData?.orders ?? [];

  const filtered = filterStatus
    ? all_items.filter(o => o.status === filterStatus)
    : all_items;

  return (
    <div className="profile__ticket">
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
        <MyOrderItems
          itemsPerPage={8}
          items={filtered}
          reviewOverview={reviewOverview}
          refetchOverview={refetchOverview}
        />
      )}
    </div>
  );
};

export default MyOrders;

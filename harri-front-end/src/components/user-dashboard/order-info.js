'use client';
import React from "react";
import { Box, Delivery, Processing, Truck } from "@svg/index";
import { useSelector } from "react-redux";
import { useLanguage } from "src/context/LanguageContext";
import { getFullName } from "src/utils/user-name";

function SingleOrderInfo({ icon, info, title, onClick }) {
  return (
    <div className="col-6 col-md-3 mb-3">
      <button
        onClick={onClick}
        type="button"
        style={{
          width: "100%",
          background: "#fff",
          border: "1px solid #eaeaea",
          borderRadius: "12px",
          padding: "20px 16px",
          textAlign: "center",
          cursor: "pointer",
          transition: "box-shadow 0.2s, border-color 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(3,4,28,0.10)"; e.currentTarget.style.borderColor = "#b5cc80"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#eaeaea"; }}
      >
        <div style={{ color: "#6a9a2a", marginBottom: "8px", display: "flex", justifyContent: "center" }}>
          {icon}
        </div>
        <div style={{ fontSize: "32px", fontWeight: "800", lineHeight: 1, marginBottom: "6px", color: "#111827" }}>
          {info ?? "0"}
        </div>
        <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>
          {title}
        </div>
      </button>
    </div>
  );
}

const OrderInfo = ({ orderData, onCardClick }) => {
  const { user } = useSelector(state => state.auth);
  const { t } = useLanguage();

  const orders = orderData?.orders ?? [];
  const counts = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="profile__main">
      <div className="profile__main-top pb-40">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="profile__main-inner d-flex flex-wrap align-items-center">
              <div className="profile__main-content">
                <h4 className="profile__main-title text-capitalize">{t('welcomeUser')} {getFullName(user)}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="profile__main-info">
        <div className="row gx-3">
          <SingleOrderInfo
            info={counts.total}
            icon={<Box />}
            title={t('totalOrders')}
            onClick={() => onCardClick(null)}
          />
          <SingleOrderInfo
            info={counts.pending}
            icon={<Processing />}
            title={t('pendingOrder')}
            onClick={() => onCardClick('pending')}
          />
          <SingleOrderInfo
            info={counts.processing}
            icon={<Truck />}
            title={t('processingOrder')}
            onClick={() => onCardClick('processing')}
          />
          <SingleOrderInfo
            info={counts.delivered}
            icon={<Delivery />}
            title={t('completeOrder')}
            onClick={() => onCardClick('delivered')}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderInfo;

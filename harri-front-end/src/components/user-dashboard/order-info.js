'use client';
import React from "react";
import { Box, Delivery, Processing, Truck } from "@svg/index";
import { useSelector } from "react-redux";
import { useLanguage } from "src/context/LanguageContext";

function SingleOrderInfo({ icon, info, title, onClick }) {
  return (
    <div className="col-md-3 col-sm-6 mb-3">
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
        <div style={{ fontSize: "32px", fontWeight: "800", lineHeight: 1, marginBottom: "4px", color: "#111827" }}>
          {info ?? "—"}
        </div>
        <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "400", marginBottom: "2px" }}>
          sipariş
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
  return (
    <div className="profile__main">
      <div className="profile__main-top pb-40">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="profile__main-inner d-flex flex-wrap align-items-center">
              <div className="profile__main-content">
                <h4 className="profile__main-title text-capitalize">{t('welcomeUser')} {user?.name}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="profile__main-info">
        <div className="row gx-3">
          <SingleOrderInfo
            info={orderData?.totalDoc}
            icon={<Box />}
            title={t('totalOrders')}
            onClick={() => onCardClick(null)}
          />
          <SingleOrderInfo
            info={orderData?.pending}
            icon={<Processing />}
            title={t('pendingOrder')}
            onClick={() => onCardClick('pending')}
          />
          <SingleOrderInfo
            info={orderData?.processing}
            icon={<Truck />}
            title={t('processingOrder')}
            onClick={() => onCardClick('processing')}
          />
          <SingleOrderInfo
            info={orderData?.delivered}
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

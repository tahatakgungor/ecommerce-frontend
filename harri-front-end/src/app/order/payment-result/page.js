"use client";
import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useConfirmPaymentMutation } from "src/redux/features/order/orderApi";
import { clear_cart } from "src/redux/features/cartSlice";
import { clear_coupon } from "src/redux/features/coupon/couponSlice";
import { notifySuccess, notifyError } from "@utils/toast";
import { useLanguage } from "src/context/LanguageContext";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { lang } = useLanguage();
  const [confirmPayment] = useConfirmPaymentMutation();
  const [processing, setProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const isConfirming = useRef(false);

  useEffect(() => {
    if (isConfirming.current) return;

    const token = searchParams.get("token");
    const callbackError = searchParams.get("error");
    const status = searchParams.get("status");

    if (callbackError || !token || status !== "success") {
      setErrorMessage(
        lang === "tr"
          ? "Ödeme işlemi başarısız veya iptal edildi."
          : "Payment failed or was cancelled."
      );
      setProcessing(false);
      return;
    }

    isConfirming.current = true;
    let conversationId = "";
    let pendingOrder = {};

    if (typeof window !== "undefined") {
      conversationId = sessionStorage.getItem("iyzico_conversation_id") || "";
      try {
        pendingOrder = JSON.parse(sessionStorage.getItem("iyzico_pending_order") || "{}");
      } catch {
        pendingOrder = {};
      }
    }

    confirmPayment({ token, conversationId, ...pendingOrder })
      .unwrap()
      .then((result) => {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("iyzico_conversation_id");
          sessionStorage.removeItem("iyzico_pending_order");
        }
        dispatch(clear_cart());
        dispatch(clear_coupon());
        notifySuccess(lang === "tr" ? "Siparişiniz alındı!" : "Your order has been placed!");
        router.push(`/order/${result.orderId}`);
      })
      .catch((err) => {
        setErrorMessage(
          err?.data?.message ||
            (lang === "tr" ? "Ödeme doğrulanamadı." : "Payment could not be verified.")
        );
        setProcessing(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (processing) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <div className="tp-loader" />
        <p>{lang === "tr" ? "Ödemeniz doğrulanıyor, lütfen bekleyin..." : "Verifying your payment, please wait..."}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        textAlign: "center",
        padding: "0 16px",
      }}
    >
      <p style={{ color: "#e53935", fontSize: 18 }}>{errorMessage}</p>
      <button
        className="tp-btn"
        onClick={() => router.push("/checkout")}
      >
        {lang === "tr" ? "Checkout'a Geri Dön" : "Back to Checkout"}
      </button>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="tp-loader" />
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}

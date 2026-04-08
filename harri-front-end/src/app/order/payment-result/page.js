"use client";
import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useConfirmPaymentMutation } from "src/redux/features/order/orderApi";
import { clear_cart } from "src/redux/features/cartSlice";
import { clear_coupon } from "src/redux/features/coupon/couponSlice";
import { notifySuccess } from "@utils/toast";
import { useLanguage } from "src/context/LanguageContext";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { lang } = useLanguage();
  const [confirmPayment] = useConfirmPaymentMutation();
  const [retryCount, setRetryCount] = useState(0);
  const [processing, setProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const isConfirming = useRef(false);
  const MAX_RETRIES = 3;

  const retryTimeoutRef = useRef(null);
  const isMounted = useRef(true);

  const handleConfirmAction = (token) => {
    confirmPayment({ token })
      .unwrap()
      .then((result) => {
        if (!isMounted.current) return;
        if (typeof window !== "undefined") {
          localStorage.removeItem("iyzico_conversation_id");
          localStorage.removeItem("iyzico_pending_order");
          sessionStorage.removeItem("iyzico_conversation_id");
          sessionStorage.removeItem("iyzico_pending_order");
        }
        dispatch(clear_cart());
        dispatch(clear_coupon());
        notifySuccess(lang === "tr" ? "Siparişiniz alındı!" : "Your order has been placed!");
        const invoice = result?.order?.invoice ? encodeURIComponent(result.order.invoice) : "";
        const email = result?.order?.email ? encodeURIComponent(result.order.email) : "";
        const query = invoice && email ? `?invoice=${invoice}&email=${email}` : "";
        router.replace(`/order/${result.orderId}${query}`);
      })
      .catch((err) => {
        if (!isMounted.current) return;
        if (retryCount < MAX_RETRIES) {
          const nextRetry = retryCount + 1;
          setRetryCount(nextRetry);
          const delay = Math.pow(2, nextRetry) * 1000;
          retryTimeoutRef.current = setTimeout(() => {
            handleConfirmAction(token);
          }, delay);
        } else {
          setErrorMessage(
            err?.data?.message ||
              (lang === "tr" ? "Ödeme doğrulanamadı." : "Payment could not be verified.")
          );
          setProcessing(false);
        }
      });
  };

  useEffect(() => {
    isMounted.current = true;
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    // ... rest of the setup
    
    return () => {
      isMounted.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isConfirming.current) return;

    // Frame-breaker: if we are inside the Iyzico modal iframe, redirect the parent window!
    if (window.top !== window.self) {
      window.top.location.href = window.self.location.href;
      return;
    }

    const token = searchParams.get("token");
    const callbackError = searchParams.get("error");
    const status = searchParams.get("status");

    if (callbackError || !token || (status && status !== "success")) {
      setErrorMessage(
        lang === "tr"
          ? "Ödeme işlemi başarısız veya iptal edildi."
          : "Payment failed or was cancelled."
      );
      setProcessing(false);
      return;
    }

    handleConfirmAction(token);
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
        <p>
          {lang === "tr" 
            ? (retryCount > 0 ? "Gecikme yaşanıyor, tekrar deneniyor..." : "Ödemeniz doğrulanıyor, lütfen bekleyin...") 
            : (retryCount > 0 ? "Experience delay, retrying..." : "Verifying your payment, please wait...")}
        </p>
      </div>
    );
  }

  const handleBackToCheckout = () => {
    // If we have a pending order but no user, it's likely session was lost
    router.push("/checkout");
  };

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
        onClick={handleBackToCheckout}
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

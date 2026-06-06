import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from "react";

import { toUserFriendlyErrorMessage } from "@/lib/http-client";
import { initializeCheckoutPayment } from "@/modules/checkout/api";
import { splitCustomerName, toCheckoutCartItems } from "@/modules/checkout/checkout-logic";
import { clearPendingPaymentSession, readPendingPaymentSession, writePendingPaymentSession } from "@/modules/checkout/pending-payment-store";
import { buildMobilePaymentReturnUrl, createCheckoutSessionId, PENDING_PAYMENT_TTL_MS } from "@/modules/checkout/session-guard";
import type { CheckoutFormDraft, CheckoutTotals, PendingPaymentSession } from "@/modules/checkout/types";
import type { CartLineItem } from "@/modules/cart/types";

type CheckoutContextValue = {
  pendingPayment: PendingPaymentSession | null;
  paymentMarkup: string | null;
  paymentMarkupSessionId: string | null;
  isHydrating: boolean;
  isInitializing: boolean;
  error: string | null;
  startCheckout: (draft: CheckoutFormDraft, items: CartLineItem[], totals: CheckoutTotals, mobileReturnUrl: string) => Promise<void>;
  clearPendingPayment: () => Promise<void>;
  hydratePendingPayment: () => Promise<PendingPaymentSession | null>;
  clearPaymentMarkup: (sessionId?: string) => void;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);
let volatilePaymentMarkup: string | null = null;
let volatilePaymentSessionId: string | null = null;

export function readVolatilePaymentMarkup(sessionId?: string) {
  if (sessionId && volatilePaymentSessionId && sessionId !== volatilePaymentSessionId) {
    return null;
  }
  return volatilePaymentMarkup;
}

export function CheckoutProvider({ children }: PropsWithChildren) {
  const [pendingPayment, setPendingPayment] = useState<PendingPaymentSession | null>(null);
  const [paymentMarkup, setPaymentMarkup] = useState<string | null>(null);
  const [paymentMarkupSessionId, setPaymentMarkupSessionId] = useState<string | null>(null);
  const paymentMarkupSessionIdRef = useRef<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    readPendingPaymentSession()
      .then((storedPendingPayment) => {
        if (active) {
          setPendingPayment(storedPendingPayment);
        }
      })
      .finally(() => {
        if (active) {
          setIsHydrating(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const startCheckout = async (draft: CheckoutFormDraft, items: CartLineItem[], totals: CheckoutTotals, mobileReturnUrl: string) => {
    if (items.length === 0) {
      throw new Error("Cart is empty");
    }

    setIsInitializing(true);
    setError(null);
    volatilePaymentMarkup = null;
    volatilePaymentSessionId = null;
    setPaymentMarkup(null);
    setPaymentMarkupSessionId(null);
    paymentMarkupSessionIdRef.current = null;
    setPendingPayment(null);
    await clearPendingPaymentSession();

    try {
      const normalizedName = draft.name.trim().replace(/\s+/g, " ");
      const { firstName, lastName } = splitCustomerName(normalizedName);
      const checkoutSessionId = createCheckoutSessionId();
      const pendingCreatedAt = new Date().toISOString();
      const pendingExpiresAt = new Date(Date.now() + PENDING_PAYMENT_TTL_MS).toISOString();

      const result = await initializeCheckoutPayment({
        ...draft,
        name: normalizedName,
        firstName,
        lastName,
        shippingOption: "standard",
        cart: toCheckoutCartItems(items),
        shippingCost: totals.shippingCost,
        subTotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        totalAmount: totals.totalAmount,
        couponCode: draft.couponCode?.trim() || undefined,
        agreementAccepted: true,
        agreementAcceptedAt: new Date().toISOString(),
        mobileReturnUrl: buildMobilePaymentReturnUrl(mobileReturnUrl, checkoutSessionId),
      });

      const nextPendingPayment: PendingPaymentSession = {
        checkoutSessionId,
        conversationId: result.conversationId,
        confirmationToken: result.confirmationToken,
        customerEmail: draft.email.trim(),
        createdAt: pendingCreatedAt,
        expiresAt: pendingExpiresAt,
        subtotal: totals.subtotal,
        totalAmount: totals.totalAmount,
        itemCount: items.reduce((count, item) => count + item.quantity, 0),
      };

      await writePendingPaymentSession(nextPendingPayment);
      volatilePaymentMarkup = result.checkoutFormContent;
      volatilePaymentSessionId = nextPendingPayment.checkoutSessionId || null;
      setPendingPayment(nextPendingPayment);
      setPaymentMarkup(result.checkoutFormContent);
      setPaymentMarkupSessionId(nextPendingPayment.checkoutSessionId || null);
      paymentMarkupSessionIdRef.current = nextPendingPayment.checkoutSessionId || null;
    } catch (nextError) {
      setError(toUserFriendlyErrorMessage(nextError, "Ödeme oturumu başlatılamadı."));
      throw nextError;
    } finally {
      setIsInitializing(false);
    }
  };

  const clearPendingPayment = async () => {
    await clearPendingPaymentSession();
    volatilePaymentMarkup = null;
    volatilePaymentSessionId = null;
    setPendingPayment(null);
    setPaymentMarkup(null);
    setPaymentMarkupSessionId(null);
    paymentMarkupSessionIdRef.current = null;
    setError(null);
  };

  const hydratePendingPayment = async () => {
    const nextPendingPayment = await readPendingPaymentSession();
    setPendingPayment(nextPendingPayment);
    return nextPendingPayment;
  };

  const clearPaymentMarkup = (sessionId?: string) => {
    if (!sessionId || volatilePaymentSessionId === sessionId) {
      volatilePaymentMarkup = null;
      volatilePaymentSessionId = null;
    }

    setPaymentMarkup((currentMarkup) => {
      if (!sessionId || paymentMarkupSessionIdRef.current === sessionId) {
        return null;
      }
      return currentMarkup;
    });
    setPaymentMarkupSessionId((currentSessionId) => {
      if (!sessionId || currentSessionId === sessionId) {
        paymentMarkupSessionIdRef.current = null;
        return null;
      }
      return currentSessionId;
    });
  };

  const value = useMemo<CheckoutContextValue>(
    () => ({
      pendingPayment,
      paymentMarkup,
      paymentMarkupSessionId,
      isHydrating,
      isInitializing,
      error,
      startCheckout,
      clearPendingPayment,
      hydratePendingPayment,
      clearPaymentMarkup,
    }),
    [error, isHydrating, isInitializing, paymentMarkup, paymentMarkupSessionId, pendingPayment]
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within CheckoutProvider");
  }
  return context;
}

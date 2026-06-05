import { clearSecureJsonValue, readSecureJsonValue, writeSecureJsonValue } from "@/lib/secure-json-store";
import { isPendingPaymentSessionExpired } from "@/modules/checkout/session-guard";
import type { PendingPaymentSession } from "@/modules/checkout/types";

const PENDING_PAYMENT_STORAGE_KEY = "serravit.mobile.pending-payment.v1";

export async function readPendingPaymentSession() {
  const pendingPayment = await readSecureJsonValue<PendingPaymentSession | null>(PENDING_PAYMENT_STORAGE_KEY, null);

  if (pendingPayment && isPendingPaymentSessionExpired(pendingPayment)) {
    await clearPendingPaymentSession();
    return null;
  }

  return pendingPayment;
}

export async function writePendingPaymentSession(value: PendingPaymentSession) {
  await writeSecureJsonValue(PENDING_PAYMENT_STORAGE_KEY, value);
}

export async function clearPendingPaymentSession() {
  await clearSecureJsonValue(PENDING_PAYMENT_STORAGE_KEY);
}

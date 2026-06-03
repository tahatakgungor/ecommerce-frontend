export function canSubmitReturnRequest(reason, isSubmitting = false) {
  return Boolean(String(reason || "").trim()) && !isSubmitting;
}

export function buildReturnRequestPayload(orderId, reason, note) {
  const trimmedNote = String(note || "").trim();
  return {
    orderId,
    reason,
    customerNote: trimmedNote || undefined,
  };
}

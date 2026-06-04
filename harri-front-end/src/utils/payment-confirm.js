export function resolvePaymentConfirmPayload({
  token,
  conversationIdFromState,
  confirmationTokenFromState,
  storage,
}) {
  const safeToken = typeof token === "string" ? token.trim() : "";
  const safeStateConversationId =
    typeof conversationIdFromState === "string" ? conversationIdFromState.trim() : "";
  const safeStateConfirmationToken =
    typeof confirmationTokenFromState === "string" ? confirmationTokenFromState.trim() : "";

  const readStorage = (key) => {
    if (!storage || typeof storage.getItem !== "function") return "";
    const value = storage.getItem(key);
    return typeof value === "string" ? value.trim() : "";
  };

  const storedConversationId =
    readStorage("iyzico_conversation_id") || readStorage("iyzico_pending_order");
  const storedConfirmationToken = readStorage("iyzico_confirmation_token");

  return {
    token: safeToken,
    conversationId: safeStateConversationId || storedConversationId || undefined,
    confirmationToken: safeStateConfirmationToken || storedConfirmationToken || undefined,
  };
}

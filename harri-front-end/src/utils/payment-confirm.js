export function resolvePaymentConfirmPayload({
  token,
  conversationIdFromState,
  storage,
}) {
  const safeToken = typeof token === "string" ? token.trim() : "";
  const safeStateConversationId =
    typeof conversationIdFromState === "string" ? conversationIdFromState.trim() : "";

  const readStorage = (key) => {
    if (!storage || typeof storage.getItem !== "function") return "";
    const value = storage.getItem(key);
    return typeof value === "string" ? value.trim() : "";
  };

  const storedConversationId =
    readStorage("iyzico_conversation_id") || readStorage("iyzico_pending_order");

  return {
    token: safeToken,
    conversationId: safeStateConversationId || storedConversationId || undefined,
  };
}

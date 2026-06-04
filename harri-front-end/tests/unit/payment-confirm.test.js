import { describe, expect, it } from "vitest";
import { resolvePaymentConfirmPayload } from "../../src/utils/payment-confirm";

function createStorage(values = {}) {
  return {
    getItem(key) {
      return values[key] ?? null;
    },
  };
}

describe("resolvePaymentConfirmPayload", () => {
  it("prefers conversation id from redux state", () => {
    const payload = resolvePaymentConfirmPayload({
      token: " iyzi-token ",
      conversationIdFromState: " state-conv ",
      storage: createStorage({
        iyzico_conversation_id: "storage-conv",
      }),
    });

    expect(payload).toEqual({
      token: "iyzi-token",
      conversationId: "state-conv",
    });
  });

  it("falls back to storage when redux state is empty", () => {
    const payload = resolvePaymentConfirmPayload({
      token: "iyzi-token",
      conversationIdFromState: "",
      storage: createStorage({
        iyzico_conversation_id: "storage-conv",
      }),
    });

    expect(payload).toEqual({
      token: "iyzi-token",
      conversationId: "storage-conv",
    });
  });

  it("supports legacy pending order storage key", () => {
    const payload = resolvePaymentConfirmPayload({
      token: "iyzi-token",
      conversationIdFromState: "",
      storage: createStorage({
        iyzico_pending_order: "legacy-conv",
      }),
    });

    expect(payload).toEqual({
      token: "iyzi-token",
      conversationId: "legacy-conv",
    });
  });

  it("omits conversation id when none is available", () => {
    const payload = resolvePaymentConfirmPayload({
      token: "iyzi-token",
      conversationIdFromState: null,
      storage: createStorage(),
    });

    expect(payload).toEqual({
      token: "iyzi-token",
      conversationId: undefined,
    });
  });
});

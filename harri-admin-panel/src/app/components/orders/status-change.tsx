import React, { useState } from "react";
import ReactSelect from "react-select";
import { notifySuccess } from "@/utils/toast";
import { useUpdateStatusMutation } from "@/redux/order/orderApi";

const options = [
  { value: "delivered", label: "delivered" },
  { value: "processing", label: "processing" },
  { value: "pending", label: "pending" },
  { value: "cancel", label: "cancel" },
];

const OrderStatusChange = ({ id }: { id: string }) => {
  const [updateStatus, { isLoading }] = useUpdateStatusMutation();
  const [pending, setPending] = useState<{ value: string; label: string } | null>(null);

  const handleConfirm = async () => {
    if (!pending) return;
    const res = await updateStatus({ id, status: { status: pending.value } });
    if ("data" in res && "message" in res.data) {
      notifySuccess(res.data.message);
    }
    setPending(null);
  };

  return (
    <div className="flex items-center gap-1">
      <ReactSelect
        onChange={(option) => setPending(option as { value: string; label: string } | null)}
        options={options}
        value={pending}
        placeholder="Change status"
        isDisabled={isLoading}
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          control: (base) => ({ ...base, minHeight: 32, fontSize: 12, minWidth: 140 }),
          option: (base) => ({ ...base, fontSize: 12 }),
          placeholder: (base) => ({ ...base, fontSize: 12, whiteSpace: "nowrap" }),
        }}
      />
      {pending && !isLoading && (
        <>
          <button
            onClick={handleConfirm}
            title="Confirm"
            className="w-7 h-7 flex items-center justify-center rounded bg-green-500 text-white hover:bg-green-600 flex-shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => setPending(null)}
            title="Cancel"
            className="w-7 h-7 flex items-center justify-center rounded bg-gray-200 text-gray-600 hover:bg-gray-300 flex-shrink-0"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </>
      )}
      {isLoading && (
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin flex-shrink-0" />
      )}
    </div>
  );
};

export default OrderStatusChange;

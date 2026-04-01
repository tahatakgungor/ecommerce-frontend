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
    <div style={{ minWidth: 150 }}>
      <ReactSelect
        onChange={(option) => setPending(option as { value: string; label: string } | null)}
        options={options}
        value={pending}
        placeholder="Select status..."
        isDisabled={isLoading}
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          control: (base) => ({ ...base, minHeight: 36, fontSize: 13 }),
          option: (base) => ({ ...base, fontSize: 13 }),
        }}
      />
      {pending && (
        <div className="flex gap-1 mt-1">
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 text-xs py-1 rounded bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? "..." : "Confirm"}
          </button>
          <button
            onClick={() => setPending(null)}
            disabled={isLoading}
            className="flex-1 text-xs py-1 rounded bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderStatusChange;

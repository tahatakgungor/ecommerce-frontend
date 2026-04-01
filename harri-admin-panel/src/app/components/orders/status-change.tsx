import React, { useState } from "react";
import ReactSelect from "react-select";
import { notifySuccess } from "@/utils/toast";
import { useUpdateStatusMutation } from "@/redux/order/orderApi";

// option
const options = [
  { value: "delivered", label: "delivered" },
  { value: "processing", label: "processing" },
  { value: "pending", label: "pending" },
  { value: "cancel", label: "cancel" },
];

const OrderStatusChange = ({ id }: { id: string }) => {
  const [updateStatus] = useUpdateStatusMutation();
  const [pending, setPending] = useState<{ value: string; label: string } | null>(null);

  const handleChange = (option: { value: string; label: string } | null) => {
    if (option) setPending(option);
  };

  const handleConfirm = async () => {
    if (!pending) return;
    const res = await updateStatus({ id, status: { status: pending.value } });
    if ("data" in res && "message" in res.data) {
      notifySuccess(res.data.message);
    }
    setPending(null);
  };

  const handleCancel = () => setPending(null);

  return (
    <>
      <ReactSelect
        onChange={handleChange}
        options={options}
        value={pending}
        placeholder="Durum seç..."
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      />
      {pending && (
        <div className="flex items-center gap-1 mt-1">
          <button
            onClick={handleConfirm}
            className="text-[11px] px-2 py-1 rounded bg-success text-white font-medium hover:opacity-80"
          >
            Onayla
          </button>
          <button
            onClick={handleCancel}
            className="text-[11px] px-2 py-1 rounded bg-gray-200 text-gray-700 font-medium hover:opacity-80"
          >
            İptal
          </button>
        </div>
      )}
    </>
  );
};

export default OrderStatusChange;

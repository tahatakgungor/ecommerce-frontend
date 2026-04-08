import Link from "next/link";
import React, { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useGetSingleOrderQuery } from "@/redux/order/orderApi";
import { Invoice, View } from "@/svg";
import { notifyError } from "@/utils/toast";
import InvoicePrint from "./invoice-print";

type OrderActionsProps = {
  id: string;
  cls?: string;
  asCell?: boolean;
};

const OrderActions = ({ id, cls, asCell = true }: OrderActionsProps) => {
  const [showInvoice, setShowInvoice] = useState<boolean>(false);
  const [showView, setShowView] = useState<boolean>(false);
  const printRefTwo = useRef<HTMLDivElement | null>(null);
  const { data: orderData } = useGetSingleOrderQuery(id);

  const handlePrint = useReactToPrint({
    content: () => printRefTwo?.current,
    documentTitle: "Receipt",
  });

  const handlePrintReceipt = async () => {
    try {
      handlePrint();
    } catch (err) {
      console.log("order by user id error", err);
      notifyError("Failed to print");
    }
    // console.log('id', id);
  };

  const actionButtons = (
    <div className="flex items-center justify-end gap-2">
      <div className="relative">
        <button
          onMouseEnter={() => setShowInvoice(true)}
          onMouseLeave={() => setShowInvoice(false)}
          onClick={handlePrintReceipt}
          aria-label="Sipariş faturasını yazdır"
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md bg-gray px-3 text-black hover:bg-theme hover:text-white"
        >
          <Invoice />
        </button>
        <div
          className={`${
            showInvoice ? "flex" : "hidden"
          } pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 flex-col items-center`}
        >
          <span className="inline-block w-max rounded bg-slate-800 px-2 py-1 text-tiny font-medium leading-none text-white">
            Print
          </span>
          <div className="-mt-2 h-3 w-3 rotate-45 bg-black" />
        </div>
      </div>
      <div className="relative">
        <Link
          onMouseEnter={() => setShowView(true)}
          onMouseLeave={() => setShowView(false)}
          href={`/orders/${id}`}
          aria-label="Sipariş detayını görüntüle"
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md bg-gray px-3 text-black hover:bg-theme hover:text-white"
        >
          <View />
        </Link>
        <div
          className={`${
            showView ? "flex" : "hidden"
          } pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 flex-col items-center`}
        >
          <span className="inline-block w-max rounded bg-slate-800 px-2 py-1 text-tiny font-medium leading-none text-white">
            View
          </span>
          <div className="-mt-2 h-3 w-3 rotate-45 bg-black" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ display: "none" }}>
        {orderData && (
          <div ref={printRefTwo}>
            <InvoicePrint orderData={orderData} />
          </div>
        )}
      </div>

      {asCell ? (
        <td className={`${cls ? cls : "px-9 py-3 text-end"}`}>
          {actionButtons}
        </td>
      ) : (
        actionButtons
      )}
    </>
  );
};

export default OrderActions;

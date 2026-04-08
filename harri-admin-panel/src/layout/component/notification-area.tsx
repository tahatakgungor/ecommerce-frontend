import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Notification, Close } from "@/svg";
import { useGetAllOrdersQuery } from "@/redux/order/orderApi";
import default_img from '@assets/img/product/prodcut-1.jpg';

// prop type
type IPropType = {
  nRef: React.RefObject<HTMLDivElement>;
  notificationOpen: boolean;
  handleNotificationOpen: () => void;
};

const NotificationArea = ({nRef,notificationOpen,handleNotificationOpen}: IPropType) => {
  const {data: allOrders} = useGetAllOrdersQuery();
  const router = useRouter();

  // Sort newest first, take latest 4
  const latestOrders = [...(allOrders?.data?.orders ?? [])]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 4);

  const [dismissed, setDismissed] = useState<string[]>([]);

  const visible = latestOrders.filter(o => !dismissed.includes(o._id));

  const dismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(prev => [...prev, id]);
  };

  const dismissAll = () => setDismissed(latestOrders.map(o => o._id));

  const goToOrder = (id: string) => {
    handleNotificationOpen();
    router.push(`/order-details/${id}`);
  };

  return (
    <div ref={nRef}>
      <button
        onClick={handleNotificationOpen}
        className="relative w-[40px] h-[40px] leading-[40px] rounded-md text-gray border border-gray hover:bg-themeLight hover:text-theme hover:border-themeLight"
      >
        <Notification />
        {visible.length > 0 && (
          <span className="w-[20px] h-[20px] inline-block bg-danger rounded-full absolute -top-[4px] -right-[4px] border-[2px] border-white text-xs leading-[18px] font-medium text-white">
            {visible.length}
          </span>
        )}
      </button>

      {notificationOpen && (
        <div className="absolute h-auto top-full right-0 shadow-lg rounded-md bg-white py-5 px-5 w-[min(92vw,340px)]">
          {visible.length === 0 ? (
            <p className="text-center text-tiny text-gray-400 py-2">Bildirim yok</p>
          ) : (
            <>
              {visible.map((item) => (
                <div
                  key={item._id}
                  onClick={() => goToOrder(item._id)}
                  className="flex items-center justify-between last:border-0 border-b border-gray pb-4 mb-4 last:pb-0 last:mb-0 cursor-pointer hover:bg-gray-50 rounded px-1"
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      <Image
                        className="w-[40px] h-[40px] rounded-md"
                        src={default_img}
                        alt="img"
                        width={40}
                        height={40}
                        priority
                      />
                    </div>
                    <div>
                      <h6 className="font-medium text-gray-500 mb-0">
                        {item.name}{" "}
                        <span className="font-bold">₺{item.totalAmount}</span>{" "}
                        sipariş verdi!
                      </h6>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] px-2 py-1 rounded-md leading-none text-success bg-success/10 font-medium">
                          Yeni Sipariş
                        </span>
                        <span className="text-tiny leading-none">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString('tr-TR', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          }) : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => dismiss(item._id, e)}
                    className="hover:text-danger flex-shrink-0 ml-2"
                    title="Bildirimi kapat"
                  >
                    <Close />
                  </button>
                </div>
              ))}
              <div className="text-center mt-3">
                <button
                  onClick={dismissAll}
                  className="text-tiny text-gray-400 hover:text-danger underline"
                >
                  Tümünü temizle
                </button>
                <button
                  onClick={() => {
                    handleNotificationOpen();
                    router.push("/activity-logs");
                  }}
                  className="ml-3 text-tiny text-blue-500 hover:text-blue-700 underline"
                >
                  Tüm Aktivite Logları
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationArea;

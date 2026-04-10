import Image from "next/image";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Notification, Close } from "@/svg";
import { useGetAllOrdersQuery } from "@/redux/order/orderApi";
import { useGetAdminReturnsQuery } from "@/redux/returns/returnsApi";
import { useGetContactMessagesQuery } from "@/redux/contact/contactApi";
import { useGetActivityLogsQuery } from "@/redux/activity/activityApi";
import default_img from '@assets/img/product/prodcut-1.jpg';

// prop type
type IPropType = {
  nRef: React.RefObject<HTMLDivElement>;
  notificationOpen: boolean;
  handleNotificationOpen: () => void;
};

const NotificationArea = ({nRef,notificationOpen,handleNotificationOpen}: IPropType) => {
  const {data: allOrders} = useGetAllOrdersQuery();
  const { data: returnsData } = useGetAdminReturnsQuery();
  const { data: contactData } = useGetContactMessagesQuery();
  const { data: activityData } = useGetActivityLogsQuery({ limit: 20 });
  const router = useRouter();

  const [dismissed, setDismissed] = useState<string[]>([]);

  const notifications = useMemo(() => {
    const orderItems = [...(allOrders?.data?.orders ?? [])].map((order) => ({
      id: `order-${order._id}`,
      kind: "order" as const,
      title: `${order.name} ₺${order.totalAmount} sipariş verdi`,
      subtitle: "Yeni Sipariş",
      createdAt: order.createdAt,
      route: `/order-details/${order._id}`,
      severity: "success",
    }));

    const returnItems = [...(returnsData?.returns ?? [])].map((row: any) => ({
      id: `return-${row._id}`,
      kind: "return" as const,
      title: `${row.userEmail || "Müşteri"} iade talebi oluşturdu`,
      subtitle: "İade Talebi",
      createdAt: row.createdAt,
      route: "/returns",
      severity: "warning",
    }));

    const contactMessages = contactData?.data?.messages || contactData?.messages || [];
    const contactItems = [...contactMessages].map((row: any) => ({
      id: `contact-${row._id || row.id}`,
      kind: "contact" as const,
      title: `${row.name || "Müşteri"} iletişim mesajı gönderdi`,
      subtitle: "İletişim Talebi",
      createdAt: row.createdAt,
      route: "/contact-messages",
      severity: "info",
    }));

    const activityItems = [...(activityData?.data?.logs || [])]
      .filter((log: any) => {
        const type = String(log.eventType || "").toLowerCase();
        const target = String(log.targetType || "").toLowerCase();
        return type.includes("return") || type.includes("contact") || type.includes("request") || target.includes("contact");
      })
      .map((log: any) => ({
        id: `activity-${log.id}`,
        kind: "activity" as const,
        title: log.message || "Yeni müşteri talebi",
        subtitle: log.eventType || "Müşteri Talebi",
        createdAt: log.createdAt,
        route: "/activity-logs",
        severity: String(log.severity || "").toUpperCase() === "ERROR" ? "danger" : "info",
      }));

    return [...orderItems, ...returnItems, ...contactItems, ...activityItems]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 8);
  }, [activityData?.data?.logs, allOrders?.data?.orders, contactData, returnsData?.returns]);

  const visible = notifications.filter((item) => !dismissed.includes(item.id));

  const dismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(prev => [...prev, id]);
  };

  const dismissAll = () => setDismissed(notifications.map((item) => item.id));

  const goToPath = (path: string) => {
    handleNotificationOpen();
    router.push(path);
  };

  const getBadgeClass = (severity: string) => {
    if (severity === "warning") return "text-amber-700 bg-amber-100";
    if (severity === "danger") return "text-rose-700 bg-rose-100";
    if (severity === "info") return "text-blue-700 bg-blue-100";
    return "text-success bg-success/10";
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
                  key={item.id}
                  onClick={() => goToPath(item.route)}
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
                        {item.title}
                      </h6>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[11px] px-2 py-1 rounded-md leading-none font-medium ${getBadgeClass(item.severity)}`}>
                          {item.subtitle}
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
                    onClick={(e) => dismiss(item.id, e)}
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

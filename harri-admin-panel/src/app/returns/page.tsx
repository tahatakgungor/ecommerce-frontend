"use client";

import Wrapper from "@/layout/wrapper";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useGetAdminReturnsQuery, useUpdateReturnStatusMutation } from "@/redux/returns/returnsApi";

const allowedTransitions: Record<string, string[]> = {
  REQUESTED: ["APPROVED", "REJECTED"],
  APPROVED: ["RECEIVED"],
  RECEIVED: ["REFUNDED"],
  REJECTED: [],
  REFUNDED: [],
};

const ReturnsPage = () => {
  const { data, isLoading } = useGetAdminReturnsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateReturnStatusMutation();
  const returns = data?.returns || [];

  const onChangeStatus = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      notifySuccess("İade durumu güncellendi.");
    } catch (err: any) {
      notifyError(err?.data?.message || "Durum güncellenemedi.");
    }
  };

  return (
    <Wrapper>
      <div className="body-content bg-slate-100">
        <Breadcrumb title="İadeler" subtitle="Sipariş bazlı iade talepleri" />
        <div className="bg-white rounded-md p-6">
          {isLoading ? (
            <p>İade talepleri yükleniyor...</p>
          ) : returns.length === 0 ? (
            <p>Henüz iade talebi yok.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray6 text-left">
                    <th className="py-2">Sipariş</th>
                    <th className="py-2">E-posta</th>
                    <th className="py-2">Neden</th>
                    <th className="py-2">Durum</th>
                    <th className="py-2">Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((item: any) => {
                    const nextStatuses = allowedTransitions[item.status] || [];
                    return (
                      <tr key={item._id} className="border-b border-gray6">
                        <td className="py-2">{item.order?.invoice || item.orderId}</td>
                        <td className="py-2">{item.userEmail}</td>
                        <td className="py-2">{item.reason}</td>
                        <td className="py-2">{item.status}</td>
                        <td className="py-2">
                          <select
                            disabled={!nextStatuses.length || isUpdating}
                            className="input h-[38px] border border-gray6 px-2 rounded-md"
                            defaultValue=""
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value) {
                                onChangeStatus(item._id, value);
                                e.currentTarget.value = "";
                              }
                            }}
                          >
                            <option value="" disabled>Durum Seç</option>
                            {nextStatuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default ReturnsPage;

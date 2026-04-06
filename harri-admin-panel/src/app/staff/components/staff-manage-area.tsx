"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import {
  useInviteStaffMutation,
  useGetAllStaffQuery,
  useDeleteStaffMutation,
  useUpdateStaffRoleMutation,
} from "@/redux/auth/authApi";
import { notifyError, notifySuccess } from "@/utils/toast";
import Pagination from "@/app/components/ui/Pagination";
import usePagination from "@/hooks/use-pagination";
import LoadingSpinner from "@/app/components/common/loading-spinner";
import ErrorMsg from "@/app/components/common/error-msg";

const StaffManageArea = () => {
  const [role, setRole] = useState<string>("Staff");
  const [inviteStaff, { isLoading: isInviting }] = useInviteStaffMutation();
  const [deleteStaff] = useDeleteStaffMutation();
  const [updateStaffRole] = useUpdateStaffRoleMutation();
  const { user } = useSelector((state: any) => state.auth);
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const { data: staffData, isError, isLoading } = useGetAllStaffQuery();
  const paginationData = usePagination(staffData?.data || [], 10);
  const { currentItems, handlePageClick, pageCount } = paginationData;

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const executeInvite = async (data: any) => {
    try {
      const res = await inviteStaff({
        email: data.email,
        role,
        sendEmail: data.sendEmail,
      }).unwrap();

      const inviteLink = res.data?.link;

      Swal.fire({
        title: data.sendEmail ? "E-posta Gönderildi!" : "Davetiye Oluşturuldu!",
        html: `<div style="background:#f4f4f4;padding:12px;border-radius:8px;border:1px dashed #ccc;word-break:break-all;font-family:monospace;font-size:13px;">
          <b>${inviteLink}</b>
        </div>`,
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Linki Kopyala",
        cancelButtonText: "Kapat",
      }).then((result) => {
        if (result.isConfirmed && inviteLink) {
          navigator.clipboard.writeText(inviteLink);
          notifySuccess("Link panoya kopyalandı!");
        }
      });
      reset();
    } catch (err: any) {
      notifyError(err?.data?.message || "Davetiye oluşturulamadı");
    }
  };

  const onSubmit = (data: any) => {
    if (!isAdmin) {
      notifyError("Bu işlem için yetkiniz bulunmamaktadır.");
      return;
    }
    Swal.fire({
      title: "Emin misiniz?",
      text: `${data.email} adresine ${role} yetkisi tanımlanacak.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Evet, Davet Et",
      cancelButtonText: "Vazgeç",
    }).then((result) => {
      if (result.isConfirmed) executeInvite(data);
    });
  };

  const handleRoleChange = (staffId: string, newRole: string, currentRole: string) => {
    if (!isAdmin) {
      notifyError("Rol değiştirme yetkiniz bulunmamaktadır.");
      return;
    }
    if (newRole === currentRole) return;
    Swal.fire({
      title: "Rolü Değiştir",
      text: `Personelin rolünü "${newRole}" olarak güncellemek istiyor musunuz?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Evet, Güncelle",
      cancelButtonText: "Vazgeç",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await updateStaffRole({ id: staffId, role: newRole }).unwrap();
          notifySuccess("Personel rolü başarıyla güncellendi.");
        } catch (error: any) {
          notifyError(error?.data?.message || "Rol güncellenemedi.");
        }
      }
    });
  };

  const handleDelete = (staffId: string) => {
    if (!isAdmin) {
      notifyError("Silme yetkiniz bulunmamaktadır.");
      return;
    }
    Swal.fire({
      title: "Emin misiniz?",
      text: "Bu personeli silmek istediğinize emin misiniz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Evet, sil!",
      cancelButtonText: "Vazgeç",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res: any = await deleteStaff(staffId).unwrap();
          Swal.fire("Silindi!", res.message || "Personel başarıyla silindi.", "success");
        } catch (error: any) {
          notifyError(error?.data?.message || "Silme işlemi başarısız oldu.");
        }
      }
    });
  };

  let tableContent = null;
  if (isLoading) tableContent = <LoadingSpinner />;
  if (!isLoading && isError) tableContent = <ErrorMsg msg="Personel verileri alınamadı." />;
  if (!isLoading && !isError && staffData?.data) {
    if (staffData.data.length === 0) {
      tableContent = <ErrorMsg msg="Henüz kayıtlı personel bulunamadı." />;
    } else {
      tableContent = (
        <>
          <div className="admin-table-shell">
            <table className="w-full text-base text-left text-gray-500">
              <thead>
                <tr className="border-b border-gray6 text-tiny">
                  <th className="pr-8 py-3 text-tiny text-text2 uppercase font-semibold">Personel</th>
                  <th className="px-3 py-3 text-tiny text-text2 uppercase font-semibold">E-posta</th>
                  <th className="px-3 py-3 text-tiny text-text2 uppercase font-semibold">Rol</th>
                  {isAdmin && (
                    <th className="px-3 py-3 text-tiny text-text2 uppercase font-semibold">Rol Değiştir</th>
                  )}
                  {isAdmin && (
                    <th className="px-3 py-3 text-tiny text-text2 uppercase font-semibold text-right">Sil</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item: any) => (
                  <tr key={item.id} className="bg-white border-b border-gray6 last:border-0 hover:bg-gray-50">
                    <td className="pr-8 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-theme/10 flex items-center justify-center text-theme font-bold">
                          {item.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span className="font-medium text-heading">{item.name || "-"}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-normal text-text2">{item.email}</td>
                    <td className="px-3 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.role?.toLowerCase() === "admin"
                          ? "bg-theme/10 text-theme"
                          : "bg-success/10 text-success"
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-3 py-3">
                        <select
                          value={item.role}
                          onChange={(e) => handleRoleChange(item.id, e.target.value, item.role)}
                          className="border border-gray6 rounded px-2 py-1 text-xs focus:outline-none focus:border-theme"
                        >
                          <option value="Staff">Staff</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                    )}
                    {isAdmin && (
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-9 h-9 leading-[33px] text-tiny rounded-md bg-white border border-gray text-slate-600 hover:bg-danger hover:border-danger hover:text-white transition-colors"
                          title="Sil"
                        >
                          <i className="fa fa-trash text-xs" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center flex-wrap mt-6">
            <p className="mb-0 text-tiny">
              Toplam {staffData.data.length} personelden {currentItems.length} tanesi gösteriliyor.
            </p>
            <div className="pagination py-3 flex justify-end items-center">
              <Pagination handlePageClick={handlePageClick} pageCount={pageCount} />
            </div>
          </div>
        </>
      );
    }
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Davet Formu */}
      <div className={`col-span-12 lg:col-span-4 ${!isAdmin ? "opacity-60" : ""}`}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6 bg-white px-8 py-8 rounded-md shadow-sm border border-gray6">
            <h4 className="text-xl font-bold mb-2 text-black">Yeni Personel Davet Et</h4>

            {!isAdmin && (
              <div className="mb-4 p-2 bg-danger/10 text-danger text-xs rounded border border-danger/20">
                ⚠️ Sadece yöneticiler yeni personel davet edebilir. Rolünüz: <b>{user?.role || "Tanımsız"}</b>
              </div>
            )}

            <fieldset disabled={!isAdmin}>
              <div className="mb-5">
                <p className="mb-2 text-base text-black font-medium">E-posta</p>
                <input
                  {...register("email", { required: "E-posta zorunludur" })}
                  type="email"
                  placeholder="ornek@sirket.com"
                  className="w-full border border-gray6 rounded px-4 py-2 text-sm focus:outline-none focus:border-theme"
                />
                {errors.email && (
                  <p className="text-danger text-xs mt-1">{errors.email.message as string}</p>
                )}
              </div>

              <div className="mb-5">
                <p className="mb-2 text-base text-black font-medium">Yetki Rolü</p>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-gray6 rounded px-4 py-2 text-sm focus:outline-none focus:border-theme"
                >
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center mb-6 px-1">
                <input
                  {...register("sendEmail")}
                  type="checkbox"
                  id="sendEmail"
                  className="w-4 h-4 text-theme border-gray-300 rounded focus:ring-theme cursor-pointer"
                />
                <label htmlFor="sendEmail" className="ml-2 text-tiny text-text2 cursor-pointer">
                  E-posta olarak gönder
                </label>
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={isInviting || !isAdmin}
              className={`tp-btn px-7 py-3 w-full justify-center text-white transition-all ${
                isAdmin ? "bg-theme hover:bg-theme-2" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {!isAdmin ? "Yetkiniz Yok" : isInviting ? "İşleniyor..." : "Davet Linki Oluştur"}
            </button>
          </div>
        </form>
      </div>

      {/* Personel Listesi */}
      <div className="col-span-12 lg:col-span-8">
        <div className="relative overflow-hidden bg-white px-8 py-6 rounded-md shadow-sm border border-gray6">
          <h4 className="text-xl font-bold mb-4 text-black">Personel Listesi</h4>
          {tableContent}
        </div>
      </div>
    </div>
  );
};

export default StaffManageArea;

"use client";
import React, { useState, useEffect } from "react";
import StaffTables from "./staff-table";
import FormFieldTwo from "../brand/form-field-two";
import AdminRole from "../profile/admin-role";
import { useInviteStaffMutation } from "@/redux/auth/authApi";
import { useForm } from "react-hook-form";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

const AddStaffArea = () => {
  // Varsayılan rolü "Staff" (Büyük harf uyumlu) yapıyoruz
  const [role, setRole] = useState<string>("Staff");
  const [inviteStaff, { isLoading }] = useInviteStaffMutation();

  const { user } = useSelector((state: any) => state.auth);

  // GÜVENLİ YETKİ KONTROLÜ: Harf duyarlılığını ortadan kaldırıyoruz
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const handleChange = (value: string | number | undefined) => {
    setRole(value as string);
  };

  const executeInvite = async (data: any) => {
    try {
      const res = await inviteStaff({
        email: data.email,
        role: role, // "Admin" veya "Staff" olarak gider
        sendEmail: data.sendEmail,
      }).unwrap();

      const inviteLink = res.data?.link;

      Swal.fire({
        title: data.sendEmail ? "E-posta Gönderildi!" : "Davetiye Oluşturuldu!",
        html: `<div style="background:#f4f4f4; padding:12px; border-radius:8px; border: 1px dashed #ccc; word-break:break-all; font-family: monospace; font-size: 13px;">
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

  const onSubmit = async (data: any) => {
    if (!isAdmin) {
      notifyError("Bu işlem için yetkiniz bulunmamaktadır.");
      return;
    }

    Swal.fire({
      title: "Emin misiniz?",
      text: `${data.email} adresine ${role} yetkisi tanımlanacak.${data.sendEmail ? " Ayrıca e-posta gönderilecek." : ""}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Evet, Davet Et",
      cancelButtonText: "Vazgeç",
    }).then((result) => {
      if (result.isConfirmed) {
        executeInvite(data);
      }
    });
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className={`col-span-12 lg:col-span-4 ${!isAdmin ? "opacity-60" : ""}`}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6 bg-white px-8 py-8 rounded-md shadow-sm border border-gray6">
            <h4 className="text-xl font-bold mb-2 text-black">Yeni Personel Davet Et</h4>

            {!isAdmin && (
              <div className="mb-4 p-2 bg-danger/10 text-danger text-xs rounded border border-danger/20">
                ⚠️ Sadece yöneticiler yeni personel davet edebilir. Mevcut Rolünüz: <b>{user?.role || "Tanımsız"}</b>
              </div>
            )}

            <div className="mb-5">
              <fieldset disabled={!isAdmin}>
                <div className="mb-5">
                  <FormFieldTwo register={register} errors={errors} name="email" isReq={true} type="email" />
                </div>
                <div className="mb-5">
                  <p className="mb-2 text-base text-black font-medium">Yetki Rolü</p>
                  <div className="category-add-select select-bordered">
                    <AdminRole handleChange={handleChange} />
                  </div>
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
            </div>

            <button
              type="submit"
              disabled={isLoading || !isAdmin}
              className={`tp-btn px-7 py-3 w-full justify-center text-white transition-all ${
                isAdmin ? "bg-theme hover:bg-theme-2" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {!isAdmin ? "Yetkiniz Yok" : isLoading ? "İşleniyor..." : "Davet Linki Oluştur"}
            </button>
          </div>
        </form>
      </div>
      <div className="col-span-12 lg:col-span-8">
        <StaffTables />
      </div>
    </div>
  );
};

export default AddStaffArea;
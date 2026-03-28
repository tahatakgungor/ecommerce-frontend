"use client";
import React, { useState } from "react";
import StaffTables from "./staff-table";
import FormFieldTwo from "../brand/form-field-two";
import AdminRole from "../profile/admin-role";
import { useInviteStaffMutation } from "@/redux/auth/authApi";
import { useForm } from "react-hook-form";
import { notifyError, notifySuccess } from "@/utils/toast";
import Swal from "sweetalert2";

const AddStaffArea = () => {
  const [role, setRole] = useState<string>("STAFF");
  const [inviteStaff, { isLoading }] = useInviteStaffMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const handleChange = (value: string | number | undefined) => {
    setRole(value as string);
  };

  const onSubmit = async (data: any) => {
    try {
      // Backend'e sendEmail bilgisini de g"önderiyoruz
      const res = await inviteStaff({
        email: data.email,
        role: role,
        sendEmail: data.sendEmail,
      }).unwrap();

      const inviteLink = res.data?.link;

      Swal.fire({
        title: data.sendEmail
          ? "E-posta Gönderildi!"
          : "Personel Davet Edildi!",
        html: `
          <p class="mb-3 text-sm text-text2">
            ${
              data.sendEmail
                ? "Davetiye e-posta adresine başarıyla iletildi."
                : "Davetiye linki aşağıda oluşturulmuştur."
            }
          </p>
          <div style="background:#f4f4f4; padding:12px; border-radius:8px; border: 1px dashed #ccc; word-break:break-all; font-family: monospace; font-size: 13px;">
            <b>${inviteLink}</b>
          </div>`,
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Linki Kopyala",
        cancelButtonText: "Kapat",
        confirmButtonColor: "#32c36c",
      }).then((result) => {
        if (result.isConfirmed && inviteLink) {
          navigator.clipboard.writeText(inviteLink);
          notifySuccess("Link panoya kopyalandı!");
        }
      });

      reset();
    } catch (err: any) {
      const msg = err?.data?.message || "Davetiye oluşturulamadı";
      notifyError(msg);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6 bg-white px-8 py-8 rounded-md shadow-sm border border-gray6">
            <h4 className="text-xl font-bold mb-2 text-black">
              Yeni Personel Davet Et
            </h4>
            <p className="text-tiny text-text2 mb-6">
              Personel sisteme kendi şifresiyle kayıt olacaktır. E-posta ve rol
              belirlemeniz yeterlidir.
            </p>

            <div className="mb-5">
              <FormFieldTwo
                register={register}
                errors={errors}
                name="email"
                isReq={true}
                type="email"
              />
            </div>

            <div className="mb-5">
              <p className="mb-2 text-base text-black font-medium">
                Yetki Rolü
              </p>
              <div className="category-add-select select-bordered">
                <AdminRole handleChange={handleChange} />
              </div>
            </div>

            {/* E-posta Gönder Onay Kutusu */}
            <div className="flex items-center mb-6 px-1">
              <input
                {...register("sendEmail")}
                type="checkbox"
                id="sendEmail"
                className="w-4 h-4 text-theme border-gray-300 rounded focus:ring-theme cursor-pointer"
              />
              <label
                htmlFor="sendEmail"
                className="ml-2 text-tiny text-text2 cursor-pointer select-none"
              >
                Davet linkini e-posta olarak gönder
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="tp-btn px-7 py-3 w-full justify-center text-white bg-theme hover:bg-theme-2 transition-all"
            >
              {isLoading ? "İşleniyor..." : "Davet Linki Oluştur"}
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

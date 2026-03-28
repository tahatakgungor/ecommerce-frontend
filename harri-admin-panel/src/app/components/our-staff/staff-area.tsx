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
      // API'den gelen yanıtı unwrap ediyoruz
      const res = await inviteStaff({ email: data.email, role: role }).unwrap();

      // DİKKAT: Senin ApiResponse yapına göre link 'res.data.link' içinde!
      const inviteLink = res.data?.link;

      Swal.fire({
        title: "Personel Davet Edildi!",
        // Burada undefined yazmasının sebebi res.link yazılmasıydı,
        // res.data.link olarak düzelttik.
        html: `Aşağıdaki linki kopyalayıp personele iletin: <br/><br/>
             <div style="background:#f4f4f4; padding:10px; border-radius:5px; word-break:break-all;">
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
              Personel sisteme kendi şifresiyle kayıt olacaktır. Sadece e-posta
              ve rol belirlemeniz yeterlidir.
            </p>
            <div className="mb-5">
              <FormFieldTwo
                register={register}
                errors={errors}
                name="email" // Bileşen başlığı buradan çekiyor olabilir
                isReq={true}
                type="email"
              />
            </div>
            <div className="mb-6">
              <p className="mb-2 text-base text-black font-medium">
                Yetki Rolü
              </p>
              <div className="category-add-select select-bordered">
                <AdminRole handleChange={handleChange} />
              </div>
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

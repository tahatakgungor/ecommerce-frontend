"use client";
import React, { useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { Delete, Edit } from "@/svg";
import DeleteTooltip from "../tooltip/delete-tooltip";
import EditTooltip from "../tooltip/edit-tooltip";
import { useDeleteStaffMutation } from "@/redux/auth/authApi";
import { notifyError } from "@/utils/toast";

type IPropType = {
  id: string;
};

const StaffAction = ({ id }: IPropType) => {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { user } = useSelector((state: any) => state.auth);
  const [deleteStaff] = useDeleteStaffMutation();

  // Yetki kontrolü değişkeni
  const isAdmin = user?.role === "ADMIN";

  const handleDelete = async (staffId: string) => {
    // Güvenlik: Fonksiyon çağrılsa bile yetki yoksa işlem yapma
    if (!isAdmin) return;

    Swal.fire({
      title: "Emin misiniz?",
      text: "Bu personeli silmek istediğinize emin misiniz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Evet, sil!",
      cancelButtonText: "Vazgeç",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res: any = await deleteStaff(staffId).unwrap();
          Swal.fire(
            "Silindi!",
            res.message || "Personel başarıyla silindi.",
            "success",
          );
        } catch (error: any) {
          const msg = error?.data?.message || "Silme işlemi başarısız oldu.";
          notifyError(msg);
        }
      }
    });
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      {/* Düzenleme Butonu */}
      <div className="relative">
        {isAdmin ? (
          <Link href={`/our-staff/${id}`}>
            <button
              onMouseEnter={() => setShowEdit(true)}
              onMouseLeave={() => setShowEdit(false)}
              className="w-10 h-10 leading-10 text-tiny bg-success text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <Edit />
            </button>
          </Link>
        ) : (
          <button
            disabled
            className="w-10 h-10 leading-10 text-tiny bg-gray-300 text-gray-500 rounded-md cursor-not-allowed opacity-50"
          >
            <Edit />
          </button>
        )}
        {isAdmin && <EditTooltip showEdit={showEdit} />}
      </div>

      {/* Silme Butonu */}
      <div className="relative">
        <button
          onClick={() => handleDelete(id)}
          disabled={!isAdmin}
          onMouseEnter={() => isAdmin && setShowDelete(true)}
          onMouseLeave={() => setShowDelete(false)}
          className={`w-10 h-10 leading-[33px] text-tiny rounded-md transition-colors ${
            isAdmin
              ? "bg-white border border-gray text-slate-600 hover:bg-danger hover:border-danger hover:text-white"
              : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
          }`}
        >
          <Delete />
        </button>
        {isAdmin && <DeleteTooltip showDelete={showDelete} />}
      </div>
    </div>
  );
};

export default StaffAction;

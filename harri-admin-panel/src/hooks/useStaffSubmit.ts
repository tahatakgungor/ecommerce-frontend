import { notifySuccess, notifyError } from "@/utils/toast";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAddStaffMutation, useUpdateProfileMutation } from "@/redux/auth/authApi";
import dayjs from "dayjs";
import { IStuff } from "@/types/admin-type";

const useStaffSubmit = (currentStaff?: IStuff) => {
  const [staffImg, setStaffImg] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const router = useRouter();
  // add
  const [addStaff] = useAddStaffMutation();
  // edit
  const [updateProfile] = useUpdateProfileMutation();

  // react hook form
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    if (!currentStaff) {
      return;
    }

    setStaffImg(currentStaff.image || "");
    setRole(currentStaff.role || "");
  }, [currentStaff]);

  //handleSubmitStuff
  const handleSubmitStuff = async (data: any) => {
    try {
      const stuff_data = {
        image: staffImg,
        name: data?.name,
        email: data?.email,
        phone: data?.phone,
        password: data?.password,
        role: role,
        joiningDate: data?.joiningdate
          ? data.joiningdate
          : dayjs(new Date()).format("YYYY-MM-DD"),
      };
      const res = await addStaff({ ...stuff_data });
      if ("error" in res) {
        if ("data" in res.error) {
          const errorData = res.error.data as { message?: string };
          if (typeof errorData.message === "string") {
            return notifyError(errorData.message);
          }
        }
      } else {
        notifySuccess("Personel başarıyla eklendi.");
        setIsSubmitted(true);
        reset();
        setStaffImg("");
      }
    } catch (error) {
      notifyError("Bir şeyler ters gitti.");
    }
  };
  //handle Submit edit Category
  const handleSubmitEditStuff = async (data: any, id: string) => {
    if (!currentStaff) {
      return notifyError("Personel verisi yüklenemedi.");
    }

    try {
      const stuff_data = {
        image: staffImg || currentStaff.image || "",
        name: data?.name || currentStaff.name,
        email: data?.email || currentStaff.email,
        phone: data?.phone || currentStaff.phone || "",
        password: data?.password,
        role: role || currentStaff.role,
        joiningDate: data?.joiningdate
          ? data.joiningdate
          : currentStaff.joiningDate || dayjs(new Date()).format("YYYY-MM-DD"),
      };
      const res = await updateProfile({ id, data: stuff_data });
      if ("error" in res) {
        if ("data" in res.error) {
          const errorData = res.error.data as { message?: string };
          if (typeof errorData.message === "string") {
            return notifyError(errorData.message);
          }
        }
      } else {
        notifySuccess("Personel başarıyla güncellendi.");
        router.push('/staff')
        setIsSubmitted(true);
        reset();
      }
    } catch (error) {
      notifyError("Bir şeyler ters gitti.");
    }
  };

  return {
    register,
    handleSubmit,
    setValue,
    errors,
    control,
    staffImg,
    setStaffImg,
    handleSubmitStuff,
    isSubmitted,
    handleSubmitEditStuff,
    role,
    setRole,
  };
};

export default useStaffSubmit;

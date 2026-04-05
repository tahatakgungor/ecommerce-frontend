import { useUploadImageMutation } from "@/redux/cloudinary/cloudinaryApi";
import { notifyError } from "@/utils/toast";

const MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const useUploadImage = () => {
  const [uploadImage, { data: uploadData, isError, isLoading, error }] =
    useUploadImageMutation();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        notifyError("Sadece JPG, PNG veya WEBP dosyası yükleyebilirsiniz.");
        e.target.value = "";
        return;
      }
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        notifyError("Dosya boyutu 15MB sınırını aşıyor. Lütfen daha küçük bir görsel yükleyin.");
        e.target.value = "";
        return;
      }
      const formData = new FormData();
      formData.append("image", file);
      try {
        await uploadImage(formData).unwrap();
      } catch (uploadError: any) {
        const message =
          uploadError?.data?.message ||
          "Görsel yüklenirken bir hata oluştu. Lütfen tekrar deneyin.";
        notifyError(message);
      }
    }
  };
  

  return {
    handleImageUpload,
    uploadData,
    isError,
    isLoading,
    error,
  };
};

export default useUploadImage;

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { SmClose } from "@/svg";
import { useUploadImageMultipleMutation } from "@/redux/cloudinary/cloudinaryApi";
import Loading from "../../common/loading";
import { notifyError } from "@/utils/toast";
import { normalizeMediaUrl } from "@/utils/media-url";

// prop type
type IPropType = {
  isSubmitted: boolean;
  relatedImages: string[];
  setImageURLs: React.Dispatch<React.SetStateAction<string[]>>;
  default_value?: string[];
};

const ProductVariants = ({
  setImageURLs,
  default_value,
  relatedImages,
}: IPropType) => {
  const [hasDefaultValues, setHasDefaultValues] = useState<boolean>(false);
  const [uploadImageMultiple, { isLoading }] = useUploadImageMultipleMutation();

  useEffect(() => {
    if (default_value && !hasDefaultValues) {
      setImageURLs(default_value.filter((url) => typeof url === "string" && url.trim() !== ""));
      setHasDefaultValues(true);
    }
  }, [default_value, hasDefaultValues, setImageURLs]);

  const normalizedImages = useMemo(
    () => relatedImages.map((img) => normalizeMediaUrl(img)).filter(Boolean),
    [relatedImages]
  );

  const handleUploadMultiple = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("image", file));

    const res = await uploadImageMultiple(formData);
    if ("data" in res && res.data?.data) {
      const uploadedUrls = res.data.data
        .map((item) => normalizeMediaUrl(item?.url))
        .filter((url): url is string => Boolean(url));
      setImageURLs((prev) => Array.from(new Set([...prev, ...uploadedUrls])));
    } else {
      notifyError("Görseller yüklenemedi.");
    }

    e.target.value = "";
  };

  const handleRemoveImage = (imageUrl: string) => {
    setImageURLs((prev) => prev.filter((url) => normalizeMediaUrl(url) !== imageUrl));
  };

  return (
    <div className="bg-white px-8 py-8 rounded-md mb-6">
      <h4 className="text-[22px]">Product Gallery</h4>
      <p className="text-sm text-text2 mt-2 mb-5">
        Birden fazla görsel yukleyebilirsiniz. Ilk gorsel urun detayinda ana gorsel olarak kullanilir.
      </p>

      <input
        onChange={handleUploadMultiple}
        type="file"
        name="related_images"
        id="related_images"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        multiple
        className="hidden"
      />
      <label
        htmlFor="related_images"
        className="text-tiny w-full inline-block py-2 px-4 rounded-md border border-gray6 text-center hover:cursor-pointer hover:bg-theme hover:text-white hover:border-theme transition"
      >
        {isLoading ? "Yukleniyor..." : "Galeri Gorselleri Yukle"}
      </label>

      <div className="mt-6">
        {isLoading ? (
          <Loading loading={isLoading} spinner="scale" />
        ) : normalizedImages.length === 0 ? (
          <p className="text-sm text-text2">Henuz galeri gorseli eklenmedi.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {normalizedImages.map((img, index) => (
              <div key={`${img}-${index}`} className="relative rounded-md border border-gray6 p-2">
                <Image
                  src={img}
                  alt={`related-image-${index + 1}`}
                  width={180}
                  height={180}
                  className="w-full h-[120px] object-cover rounded"
                />
                <button
                  className="absolute -top-2 -right-2 h-[28px] w-[28px] rounded-full border border-gray6 bg-white text-red-500 hover:border-red flex items-center justify-center"
                  type="button"
                  onClick={() => handleRemoveImage(img)}
                  aria-label="Galeri gorselini sil"
                >
                  <SmClose />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductVariants;

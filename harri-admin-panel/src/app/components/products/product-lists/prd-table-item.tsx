import Image from "next/image";
import React from "react";
import { IProduct } from "@/types/product-type";
import EditDeleteBtn from "../../button/edit-delete-btn";
import { useUpdateProductStatusMutation } from "@/redux/product/productApi";
import { resolveDisplayProductImage } from "@/utils/product-gallery";

const ProductTableItem = ({ product }: { product: IProduct }) => {
  const [updateStatus] = useUpdateProductStatusMutation();
  const isActive = product.status?.toLowerCase() === "active";
  const displayImage = resolveDisplayProductImage(product.image, product.relatedImages);

  const handleToggle = async () => {
    const newStatus = isActive ? "InActive" : "Active";
    await updateStatus({ id: product._id, status: newStatus });
  };

  return (
    <tr className="bg-white border-b border-gray6 last:border-0 text-start mx-9">
      <td className="pr-8 py-5 whitespace-nowrap">
        <a href="#" className="flex items-center space-x-5">
          <Image
            className="w-[60px] h-[60px] rounded-md object-cover bg-[#F2F3F5]"
            src={displayImage}
            width={60}
            height={60}
            alt="product img"
            onError={(event) => {
              const img = event.currentTarget as HTMLImageElement;
              if (img.dataset.fallbackApplied === "1") return;
              img.dataset.fallbackApplied = "1";
              img.src = "/assets/img/icons/upload.png";
            }}
          />
          <span className="font-medium text-heading text-hover-primary transition">
            {product.title}
          </span>
        </a>
      </td>
      <td className="px-3 py-3 font-normal text-[#55585B] text-end">
        #{product.sku}
      </td>
      <td className="px-3 py-3 font-normal text-[#55585B] text-end">
        {product.quantity}
      </td>
      <td className="px-3 py-3 font-normal text-[#55585B] text-end">
        <div className="flex flex-col items-end">
          <span>₺{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-gray-500 line-through">
              ₺{product.originalPrice}
            </span>
          )}
          {!!product.discount && product.discount > 0 && (
            <span className="text-xs text-danger">%{product.discount} indirim</span>
          )}
        </div>
      </td>
      <td className="px-3 py-3 text-end">
        <button
          onClick={handleToggle}
          className={`text-[11px] px-3 py-1 rounded-md leading-none font-medium cursor-pointer transition-colors
          ${isActive ? "text-success bg-success/10 hover:bg-success/20" : "text-danger bg-danger/10 hover:bg-danger/20"}`}
          title={isActive ? "Pasife al" : "Aktif et"}
        >
          {isActive ? "Aktif" : "Pasif"}
        </button>
      </td>
      <td className="px-9 py-3 text-end">
        <div className="flex items-center justify-end space-x-2">
          <EditDeleteBtn id={product._id} />
        </div>
      </td>
    </tr>
  );
};

export default ProductTableItem;

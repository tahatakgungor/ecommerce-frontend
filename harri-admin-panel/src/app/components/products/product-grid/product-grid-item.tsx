import React from "react";
import Image from "next/image";
// internal
import { IProduct } from "@/types/product-type";
import ProductGridAction from "./product-grid-action";

const ProductGridItem = ({ product }: { product: IProduct }) => {
  const { _id, image, originalPrice, price, discount, title } = product || {};
  return (
    <div className="rounded-md bg-white border-gray6 border">
      <div className="relative">
        <a href="#" className="inline-block bg-[#F2F3F5]">
          <Image
            className="w-full"
            src={image}
            width={279}
            height={297}
            alt="product img"
          />
        </a>
        <div className="absolute top-5 right-5 z-10">
          <ProductGridAction id={_id} />
        </div>
      </div>
      <div className="px-5 py-5">
        <a
          href="#"
          className="text-lg font-normal text-heading text-hover-primary mb-2 inline-block leading-none"
        >
          {title}
        </a>
        <div className="leading-none mb-2">
          <span className="text-base font-medium text-black">
            ₺{price.toFixed(2)}
          </span>
          {originalPrice > price && (
            <span className="ml-2 text-sm text-gray-500 line-through">
              ₺{originalPrice.toFixed(2)}
            </span>
          )}
          {!!discount && discount > 0 && (
            <span className="ml-2 inline-flex rounded bg-danger/10 px-2 py-1 text-xs font-medium text-danger">
              %{discount} indirim
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductGridItem;

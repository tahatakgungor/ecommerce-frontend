import Image from "next/image";
import React from "react";
import Link from "next/link";
// internal
import empty_img from "@assets/img/product/cartmini/empty-cart.png";
import { useLanguage } from "src/context/LanguageContext";

const EmptyCart = ({ search_prd = false }) => {
  const { t } = useLanguage();
  return (
    <div className="cartmini__empty text-center">
      <Image src={empty_img} alt="empty img" />
      <p>{search_prd ? t('productNotFound') : t('cartEmpty')}</p>
      {!search_prd && (
        <Link href="/shop" className="tp-btn">
          {t('goToShop')}
        </Link>
      )}
    </div>
  );
};

export default EmptyCart;

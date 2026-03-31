'use client';
import Link from "next/link";
import React from "react";
// internal
import useCartInfo from "@hooks/use-cart-info";
import { useLanguage } from "src/context/LanguageContext";

const CartTotal = () => {
  const { total } = useCartInfo();
  const { t } = useLanguage();

  return (
    <div className="cart-page-total">
      <h2>{t('cartTotals')}</h2>
      <ul className="mb-20">
        <li>
          {t('subtotal')} <span>₺{total.toFixed(2)}</span>
        </li>
        <li>
          {t('total')} <span>₺{total.toFixed(2)}</span>
        </li>
      </ul>
      <Link href="/checkout" className="tp-btn cursor-pointer">
        {t('proceedToCheckout')}
      </Link>
    </div>
  );
};

export default CartTotal;

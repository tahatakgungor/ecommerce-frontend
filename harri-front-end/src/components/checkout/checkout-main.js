"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
// internal
import Header from "@layout/header";
import CartBreadcrumb from "@components/cart/cart-breadcrumb";
import Wrapper from "@layout/wrapper";
import CouponArea from "@components/checkout/coupon-area";
import CheckoutArea from "@components/checkout/checkout-area";
import Footer from "@layout/footer";
import ShopCta from "@components/cta";
import useCheckoutSubmit from "@hooks/use-checkout-submit";
import { useLanguage } from "src/context/LanguageContext";

export default function CheckoutMainArea() {
  const checkout_data = useCheckoutSubmit();
  const { cart_products } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/checkout");
    }
  }, [user, router]);

  return (
    <Wrapper>
      <Header style_2={true} />
      <CartBreadcrumb title={t('checkout')} subtitle={t('checkout')} />
      {cart_products.length === 0 ? (
        <div className="text-center pt-80 pb-80">
          <h3 className="py-2">{t('noCartItems')}</h3>
          <Link href="/shop" className="tp-btn">
            {t('returnToShop')}
          </Link>
        </div>
      ) : (
        <>
          <CouponArea {...checkout_data} />
          <CheckoutArea {...checkout_data} />
        </>
      )}
      <ShopCta />
      <Footer />
    </Wrapper>
  );
}

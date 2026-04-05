import Wrapper from "@layout/wrapper";
import Header from "@layout/header";
import Footer from "@layout/footer";
import CartBreadcrumb from "@components/cart/cart-breadcrumb";
import CartArea from "@components/cart/cart-area";
import CheckoutSteps from "@components/checkout/checkout-steps";

export const metadata = {
  title: "Cart - Serravit",
};

export default function Cart() {
  return (
    <Wrapper>
      <Header style_2={true} />
      <CartBreadcrumb title="myCart" subtitle="cart" />
      <CheckoutSteps currentStep={1} />
      <CartArea />
      <Footer />
    </Wrapper>
  );
}

import Footer from "@layout/footer";
import Header from "@layout/header";
import Wrapper from "@layout/wrapper";
import CartBreadcrumb from "@components/cart/cart-breadcrumb";
import WishlistArea from "@components/wishlist/wishlist-area";

export const metadata = {
  title: "Wishlist - Serravit",
};

export default function Wishlist() {
  return (
    <Wrapper>
      <Header style_2={true} />
      <CartBreadcrumb title="myWishlist" subtitle="wishlist" />
      <WishlistArea />
      <Footer />
    </Wrapper>
  );
}

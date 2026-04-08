import Footer from "@layout/footer";
import Header from "@layout/header";
import Wrapper from "@layout/wrapper";
import OrderLookupArea from "@components/order-lookup/order-lookup-area";

export const metadata = {
  title: "Sipariş Takibi - Serravit",
  description: "Misafir siparişlerinizi fatura numarası ve e-posta ile takip edin.",
};

export default function OrderLookup() {
  return (
    <Wrapper>
      <Header style_2={true} />
      <OrderLookupArea />
      <Footer />
    </Wrapper>
  );
}

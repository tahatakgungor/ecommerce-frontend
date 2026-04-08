import Wrapper from "@/layout/wrapper";
import Breadcrumb from "../../components/breadcrumb/breadcrumb";
import OrderDetailsArea from "@/app/components/order-details/order-details-area";

const OrdersPage = ({ params }: { params: { id: string } }) => {
  return (
    <Wrapper>
      <div className="body-content bg-slate-100">
        {/* breadcrumb start */}
        <Breadcrumb title="Sipariş Detayı" subtitle="Sipariş Akışı ve Kargo Yönetimi" />
        {/* breadcrumb end */}

        {/* order details area */}
        <OrderDetailsArea id={params.id} />
        {/* order details area */}
      </div>
    </Wrapper>
  );
};

export default OrdersPage;

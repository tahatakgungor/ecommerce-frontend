import Wrapper from "@/layout/wrapper";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import CustomerArea from "../components/our-staff/staff-area";

const CustomersPage = () => {
  return (
    <Wrapper>
      <div className="body-content bg-slate-100">
        <Breadcrumb title="Müşteriler" subtitle="Müşteri Listesi" />
        <CustomerArea />
      </div>
    </Wrapper>
  );
};

export default CustomersPage;

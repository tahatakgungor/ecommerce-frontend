import Wrapper from "@/layout/wrapper";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import StaffManageArea from "./components/staff-manage-area";

const StaffPage = () => {
  return (
    <Wrapper>
      <div className="body-content bg-slate-100">
        <Breadcrumb title="Personel" subtitle="Personel Yönetimi" />
        <StaffManageArea />
      </div>
    </Wrapper>
  );
};

export default StaffPage;

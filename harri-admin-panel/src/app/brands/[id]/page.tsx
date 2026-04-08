import EditBrand from "@/app/components/brand/edit-brand";
import Breadcrumb from "../../components/breadcrumb/breadcrumb";
import Wrapper from "@/layout/wrapper";

const BrandPage = ({ params }: { params: { id: string } }) => {
  return (
    <Wrapper>
      <div className="body-content bg-slate-100">
        {/* breadcrumb start */}
        <Breadcrumb title="Marka Düzenle" subtitle="Marka Detayı" />
        {/* breadcrumb end */}

        {/*add category area start */}
        <EditBrand id={params.id} />
        {/*add category area end */}
      </div>
    </Wrapper>
  );
};

export default BrandPage;

import Wrapper from "@/layout/wrapper";
import AddBrand from "../components/brand/add-brand";
import Breadcrumb from "../components/breadcrumb/breadcrumb";

const BrandPage = () => {
  return (
    <Wrapper>
      <div className="body-content bg-slate-100">
        {/* breadcrumb start */}
        <Breadcrumb title="Brands" subtitle="Brands" />
        {/* breadcrumb end */}

        {/*add category area start */}
        <AddBrand />
        {/*add category area end */}
      </div>
    </Wrapper>
  );
};

export default BrandPage;

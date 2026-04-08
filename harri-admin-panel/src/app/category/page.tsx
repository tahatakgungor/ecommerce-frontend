import Wrapper from "@/layout/wrapper";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import AddCategory from "../components/category/add-category";

const CategoryPage = () => {
  return (
    <Wrapper>
      <div className="body-content bg-slate-100">
        {/* breadcrumb start */}
        <Breadcrumb title="Kategoriler" subtitle="Kategori Listesi" />
        {/* breadcrumb end */}

        {/*add category area start */}
        <AddCategory />
        {/*add category area end */}
      </div>
    </Wrapper>
  );
};

export default CategoryPage;

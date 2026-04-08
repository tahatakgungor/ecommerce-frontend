import React from "react";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import Wrapper from "@/layout/wrapper";
import ProductListArea from "../components/products/product-lists/product-list-area";

const ProductList = () => {
  return (
    <Wrapper>
      <div className="body-content bg-slate-100">
        {/* breadcrumb start */}
        <Breadcrumb title="Ürünler" subtitle="Ürün Listesi" />
        {/* breadcrumb end */}

        {/* ProductListArea start */}
        <ProductListArea />
        {/* ProductListArea end */}
      </div>
    </Wrapper>
  );
};

export default ProductList;

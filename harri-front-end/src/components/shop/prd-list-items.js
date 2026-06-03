import React from "react";
// internal
import SingleListProduct from "@components/products/single-list-product";
import Pagination from "@ui/Pagination";

const ProductListItems = ({ items, pageCount, focusPage, onPageChange }) => {
  return (
    <>
      <div
        className="tab-pane fade"
        id="nav-list"
        role="tabpanel"
        aria-labelledby="nav-list-tab"
      >
        <div className="product__list-wrapper mb-30">
          <div className="row">
            {items &&
              items.map((product) => (
                <div key={product._id} className="col-lg-12 col-md-6">
                  <SingleListProduct product={product} />
                </div>
              ))}
          </div>
        </div>

      {/* pagination start */}
      <div className="row">
        <div className="col-xxl-12">
          <div className="tp-pagination tp-pagination-style-2">
            <Pagination
              handlePageClick={onPageChange}
              focusPage={focusPage}
              pageCount={pageCount}
            />
          </div>
        </div>
      </div>
      {/* pagination end */}
      </div>
    </>
  );
};

export default ProductListItems;

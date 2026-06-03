import React from "react";
// internal
import SingleProduct from "@components/products/single-product";
import Pagination from "@ui/Pagination";

const ProductGridItems = ({ items, pageCount, focusPage, onPageChange }) => {

  return (
    <>
      <div
        className="tab-pane fade show active"
        id="nav-grid"
        role="tabpanel"
        aria-labelledby="nav-grid-tab"
      >
        {/* shop grid*/}
        <div className="row">
          {items &&
            items.map((product) => (
              <div
                key={product._id}
                className="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-6"
              >
                <SingleProduct product={product} />
              </div>
            ))}
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

export default ProductGridItems;

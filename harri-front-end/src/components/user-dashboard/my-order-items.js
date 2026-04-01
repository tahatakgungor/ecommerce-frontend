'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import Pagination from "@ui/Pagination";
import { useLanguage } from "src/context/LanguageContext";

const MyOrderItems = ({ items, itemsPerPage }) => {
  const [currentItems, setCurrentItems] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const { t } = useLanguage();
  // side effect
  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(items?.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(items.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, items]);

  // handlePageClick
  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % items.length;
    setItemOffset(newOffset);
  };
  return (
    <React.Fragment>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">{t('orderId')}</th>
            <th scope="col">{t('orderTime')}</th>
            <th scope="col">{t('statusLabel')}</th>
            <th scope="col">{t('viewLabel')}</th>
          </tr>
        </thead>
        <tbody>
          {currentItems &&
            currentItems.map((item, i) => (
              <tr key={i}>
                <th className="text-uppercase" scope="row">
                  {" "}
                  #{item?._id?.substring(20, 25)}
                </th>
                <td data-info="title">
                  {dayjs(item?.createdAt).format("MMMM D, YYYY")}
                </td>
                <td
                  className={`status ${
                    item?.status === "pending" ? "pending" : ""
                  }${item?.status === "processing" ? " hold" : ""}${item?.status === "delivered" ? " done" : ""}`}
                >
                  {item?.status === "pending" ? t('statusPending')
                    : item?.status === "processing" ? t('statusProcessing')
                    : item?.status === "delivered" ? t('statusDelivered')
                    : item?.status === "cancel" ? t('statusCancel')
                    : item?.status}
                </td>
                <td>
                  <Link href={`/order/${item._id}`} className="tp-btn">
                    {t('invoiceLink')}
                  </Link>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {/* pagination start */}
      {items.length > itemsPerPage && (
        <div className="mt-20 ml-20 tp-pagination tp-pagination-style-2">
          <Pagination handlePageClick={handlePageClick} pageCount={pageCount} />
        </div>
      )}
      {/* pagination end */}
    </React.Fragment>
  );
};

export default MyOrderItems;

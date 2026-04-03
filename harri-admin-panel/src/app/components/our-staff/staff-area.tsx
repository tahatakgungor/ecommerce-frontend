"use client";
import React from "react";
import CustomerTable from "./staff-table";

const CustomerArea = () => {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <CustomerTable />
      </div>
    </div>
  );
};

export default CustomerArea;

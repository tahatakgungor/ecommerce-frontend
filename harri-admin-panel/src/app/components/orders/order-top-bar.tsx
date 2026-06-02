import { Search } from "@/svg";
import React from "react";

const OrderTopBar = () => {
  return (
    <div className="tp-search-box flex items-center justify-between px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-wrap gap-3">
      <div className="search-input relative w-full md:w-auto md:min-w-[280px]">
        <input
          className="input h-[44px] w-full pl-14"
          type="text"
          placeholder="Sipariş numarasına göre ara"
        />
        <button className="absolute top-1/2 left-5 translate-y-[-50%] hover:text-theme">
          <Search />
        </button>
      </div>
      <div className="flex w-full md:w-auto justify-end">
        <div className="search-select flex items-center space-x-3 w-full md:w-auto">
          <span className="text-tiny inline-block leading-none whitespace-nowrap">
            Durum:
          </span>
          <select className="w-full md:w-auto">
            <option>Teslim edildi</option>
            <option>Beklemede</option>
            <option>İade edildi</option>
            <option>Reddedildi</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default OrderTopBar;

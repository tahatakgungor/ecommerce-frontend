"use client";
import React, { useEffect,useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/app/components/common/loading-overlay";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const [sideMenu, setSideMenu] = useState<boolean>(false);
  const router = useRouter();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);
  return (
    <div className="tp-main-wrapper bg-slate-100 min-h-screen overflow-x-hidden">
      <Sidebar sideMenu={sideMenu} setSideMenu={setSideMenu} />
      <div className="tp-main-content w-full lg:ml-[250px] xl:ml-[300px] lg:w-[calc(100%-250px)] xl:w-[calc(100%-300px)] min-w-0">
        {/* header start */}
        <Header setSideMenu={setSideMenu} />
        {/* header end */}

        {children}
      </div>
      <ToastContainer />
      <LoadingOverlay />
    </div>
  );
};

export default Wrapper;

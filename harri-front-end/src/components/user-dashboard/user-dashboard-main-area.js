"use client";
import { safeGetItem } from "@utils/localstorage";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
// internal
import Header from "@layout/header";
import Wrapper from "@layout/wrapper";
import Footer from "@layout/footer";
import { useGetUserOrdersQuery } from "src/redux/features/orderApi";
import DashboardArea from "@components/user-dashboard/dashboard-area";
import CartBreadcrumb from "@components/cart/cart-breadcrumb";
import Loader from "@components/loader/loader";
import ErrorMessage from "@components/error-message/error";

const UserDashboardMainArea = () => {
  const isAuthenticate = safeGetItem("user_profile");
  const {
    data: orderData,
    isError,
    isLoading,
    error,
    refetch,
  } = useGetUserOrdersQuery(undefined, {
    skip: !isAuthenticate,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: 15000,
  });
  const router = useRouter();

  useEffect(() => {
    const isAuth = safeGetItem("user_profile");
    if (!isAuth) {
      router.push("/login");
    }
    if (orderData) {
      refetch();
    }
  }, [router, orderData, refetch]);
  let content = null;

  if (isLoading) {
    content = (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <Loader loading={isLoading} />
      </div>
    );
  }
  if (isError) {
    content = <ErrorMessage message="There was an error " />;
  }
  if (orderData && !isError) {
    content = <DashboardArea orderData={orderData} />;
  }

  return (
    <Wrapper>
      <Header style_2={true} />
      <CartBreadcrumb title="myProfile" subtitle="profile" />
      {content}
      <Footer />
    </Wrapper>
  );
};

export default UserDashboardMainArea;

import React from "react";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import ProfileArea from "../components/profile/profile-area";
import Wrapper from "@/layout/wrapper";

const ProfilePage = () => {
  return (
    <Wrapper>
    <div className="body-content bg-slate-100">
      {/* breadcrumb start */}
      <Breadcrumb title="Profilim" subtitle="Hesap Bilgileri" subChild={false} />
      {/* breadcrumb end */}

      {/* profile area start */}
      <ProfileArea/>
      {/* profile area end */}
    </div>
    </Wrapper>
  );
};

export default ProfilePage;

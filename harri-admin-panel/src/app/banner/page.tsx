import Wrapper from "@/layout/wrapper";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import BannerManager from "../components/banner/banner-manager";

const BannerPage = () => {
  return (
    <Wrapper>
      <div className="body-content bg-slate-100">
        <Breadcrumb title="Hero Banners" subtitle="Homepage Ads" />
        <BannerManager />
      </div>
    </Wrapper>
  );
};

export default BannerPage;

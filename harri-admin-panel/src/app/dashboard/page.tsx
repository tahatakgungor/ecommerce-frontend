import Wrapper from "@/layout/wrapper";
import CardItems from "../components/dashboard/card-items";
import SalesReport from "../components/dashboard/sales-report";
import RecentOrders from "../components/dashboard/recent-orders";

export default function DashboardPage() {
  return (
    <Wrapper>
      <div className="body-content bg-slate-100">
        <div className="admin-page-hero flex justify-between items-end flex-wrap">
          <div className="page-title mb-0">
            <h3 className="mb-0 text-4xl">Yönetim Paneli</h3>
            <p className="text-textBody m-0">Sipariş, ürün ve operasyon akışlarını buradan yönetebilirsiniz.</p>
          </div>
        </div>

        {/* card item start  */}
        <CardItems />
        {/* card item end  */}

        {/* chart start */}
        <SalesReport />
        {/* chart end */}

        {/* recent orders start */}
        <RecentOrders />
        {/* recent orders end */}
      </div>
    </Wrapper>
  );
}

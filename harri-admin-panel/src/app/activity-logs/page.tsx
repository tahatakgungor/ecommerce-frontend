import Wrapper from "@/layout/wrapper";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import ActivityLogArea from "../components/activity/activity-log-area";

const ActivityLogsPage = () => {
  return (
    <Wrapper>
      <div className="body-content bg-slate-100">
        <Breadcrumb title="Aktivite Logları" subtitle="Sistem Akışı ve Denetim Kayıtları" />
        <ActivityLogArea />
      </div>
    </Wrapper>
  );
};

export default ActivityLogsPage;

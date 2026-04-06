import Wrapper from "@/layout/wrapper";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import ReviewArea from "../components/reviews/review-area";

const ReviewsPage = () => {
  return (
    <Wrapper>
      <div className="body-content bg-slate-100">
        <Breadcrumb title="Reviews" subtitle="Moderation Queue" />
        <ReviewArea />
      </div>
    </Wrapper>
  );
};

export default ReviewsPage;

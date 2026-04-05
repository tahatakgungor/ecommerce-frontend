import Wrapper from "@/layout/wrapper";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import NewsletterArea from "../components/newsletter/newsletter-area";

const NewsletterPage = () => {
  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100">
        <Breadcrumb title="Newsletter" subtitle="Subscribers" />
        <NewsletterArea />
      </div>
    </Wrapper>
  );
};

export default NewsletterPage;

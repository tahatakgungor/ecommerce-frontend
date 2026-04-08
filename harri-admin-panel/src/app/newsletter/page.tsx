import Wrapper from "@/layout/wrapper";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import NewsletterArea from "../components/newsletter/newsletter-area";

const NewsletterPage = () => {
  return (
    <Wrapper>
      <div className="body-content bg-slate-100">
        <Breadcrumb title="Bülten" subtitle="Abone Listesi" />
        <NewsletterArea />
      </div>
    </Wrapper>
  );
};

export default NewsletterPage;

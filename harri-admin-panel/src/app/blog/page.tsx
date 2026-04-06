import Wrapper from "@/layout/wrapper";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import BlogManager from "../components/blog/blog-manager";

const BlogPage = () => {
  return (
    <Wrapper>
      <div className="body-content bg-slate-100">
        <Breadcrumb title="Blog Yönetimi" subtitle="Storefront Blog İçerikleri" />
        <BlogManager />
      </div>
    </Wrapper>
  );
};

export default BlogPage;

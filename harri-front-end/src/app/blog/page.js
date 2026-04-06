import Footer from "@layout/footer";
import Header from "@layout/header";
import Wrapper from "@layout/wrapper";
import BlogListPage from "@components/blog/blog-list-page";

export const metadata = {
  title: "Blog - Serravit",
};

export default function BlogPage() {
  return (
    <Wrapper>
      <Header style_2={true} />
      <BlogListPage />
      <Footer />
    </Wrapper>
  );
}

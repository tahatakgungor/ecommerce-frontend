import Footer from "@layout/footer";
import Header from "@layout/header";
import Wrapper from "@layout/wrapper";
import BlogDetailsPage from "@components/blog/blog-details-page";

export const metadata = {
  title: "Blog Detay - Serravit",
};

export default function BlogDetailRoute({ params }) {
  const slug = params?.slug;
  return (
    <Wrapper>
      <Header style_2={true} />
      <BlogDetailsPage slug={slug} />
      <Footer />
    </Wrapper>
  );
}

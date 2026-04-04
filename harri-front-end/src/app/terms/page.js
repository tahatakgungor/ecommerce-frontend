import Header from "@layout/header";
import Wrapper from "@layout/wrapper";
import Footer from "@layout/footer";
import TermsPageContent from "@components/terms-policy/terms-page-content";

export const metadata = {
  title: "Terms & Conditions - Serravit",
};

export default function Terms() {
  return (
    <Wrapper>
      <Header style_2={true} />
      <TermsPageContent />
      <Footer />
    </Wrapper>
  );
}

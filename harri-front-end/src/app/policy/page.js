import Footer from "@layout/footer";
import Header from "@layout/header";
import Wrapper from "@layout/wrapper";
import PolicyPageContent from "@components/terms-policy/policy-page-content";

export const metadata = {
  title: "Policy - Serravit",
};

export default function Policy() {
  return (
    <Wrapper>
      <Header style_2={true} />
      <PolicyPageContent />
      <Footer />
    </Wrapper>
  );
}

// internal
import TextArea from "./text-area";
import Services from "./services";
import AboutGallery from "./about-gallery";
import BreadcrumbTwo from "@components/common/breadcrumb/breadcrumb-2";

const About = () => {
  return (
    <>
      <BreadcrumbTwo
        subtitle="Hakkımızda"
        title={
          <>
            SERRAVİT&apos;e <br /> Hoşgeldiniz
          </>
        }
      />
      <TextArea />
      <Services />
      <AboutGallery />
    </>
  );
};

export default About;

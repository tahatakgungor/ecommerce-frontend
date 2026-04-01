// internal
import TextArea from "./text-area";
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
    </>
  );
};

export default About;

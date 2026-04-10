import SitePageHero from "@components/common/breadcrumb/site-page-hero";

const BreadcrumbTwo = ({ subtitle, title }) => {
  return (
    <SitePageHero
      title={title}
      breadcrumbLabel={subtitle}
    />
  );
};

export default BreadcrumbTwo;

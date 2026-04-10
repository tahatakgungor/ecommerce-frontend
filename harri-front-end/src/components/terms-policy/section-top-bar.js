import React from "react";
import SitePageHero from "@components/common/breadcrumb/site-page-hero";
// internal
const SectionTop = ({ title, subtitle }) => {
  return (
    <SitePageHero title={title} breadcrumbLabel={title} description={subtitle} />
  );
};

export default SectionTop;

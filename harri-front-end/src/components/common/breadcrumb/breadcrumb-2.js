const BreadcrumbTwo = ({ subtitle, title }) => {
  return (
    <section
      className="about__heading about__heading-overlay about__spacing"
      style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-8 col-lg-10">
            <div className="about__heading-content text-center p-relative z-index-1">
              {subtitle && (
                <span className="about__heading-subtitle">{subtitle}</span>
              )}
              {title && <h3 className="about__heading-title">{title}</h3>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BreadcrumbTwo;

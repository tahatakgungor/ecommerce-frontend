import Link from "next/link";
// internal
import { Dashboard, Mobile, Website } from "@svg/index";

const service_data = [
  {
    icon: <Website />,
    project: '27+',
    title: "Yıllık Deneyim",
  },
  {
    icon: <Mobile />,
    project: '50k+',
    title: "Mutlu Müşteri",
  },
  {
    icon: <Dashboard />,
    project: '7/24',
    title: "Müşteri Desteği",
  },
];

const Services = () => {
  return (
    <>
      <section className={`services__area pb-110`}>
        <div className="container">
          <div className="row">
            {service_data.map((item, i) => (
              <div key={i} className="col-xxl-4 col-xl-4 col-lg-4 col-md-6">
                <div
                  className={`services__item-9 services__item-style-2 mb-30 transition-3`}
                >
                  <div className="services__item-9-top d-flex align-items-start justify-content-between">
                    <div className="services__icon-9">
                      <span>
                        {item.icon}
                      </span>
                    </div>
                    <div className="services__btn-9">
                      <Link href="#">
                        <i className="fa-light fa-arrow-up-right"></i>
                      </Link>
                    </div>
                  </div>
                  <div className="services__content-9">
                    <span className="services-project">
                      {item.project}
                    </span>
                    <h3 className="services__title-9">
                      <Link href="#">{item.title}</Link>
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;

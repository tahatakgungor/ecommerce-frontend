'use client';

import { DotsTwo, General, Support } from "@svg/index";
import SingleFaq from "./single-faq";
import { useLanguage } from "src/context/LanguageContext";
import { sitePagesContent } from "src/data/site-pages-content";

const tabIcons = {
  general: <General />,
  support: <Support />,
  account: <DotsTwo />,
};

function NavItem({ active, id, title, icon }) {
  return (
    <button
      className={`nav-link ${active ? "active" : ""}`}
      id={`nav-${id}-tab`}
      data-bs-toggle="tab"
      data-bs-target={`#${id}`}
      type="button"
      role="tab"
      aria-controls={`nav-${id}`}
      aria-selected={active ? "true" : "false"}
      tabIndex="-1"
    >
      <span>{icon}</span>
      {title}
    </button>
  );
}

function TabItem({ active, id, sections }) {
  return (
    <div
      className={`tab-pane fade ${active ? "show active" : ""}`}
      id={id}
      role="tabpanel"
      aria-labelledby={`nav-${id}-tab`}
    >
      {sections.map((section, index) => (
        <div key={`${id}-${index}`} className="faq__item pb-95">
          <div className="row">
            <div className="col-xl-3 col-lg-3 col-md-4">
              <div className="faq__content">
                <h3 className="faq__title-2">{section.title}</h3>
              </div>
            </div>
            <div className="col-xl-9 col-lg-9 col-md-8">
              <div className="faq__wrapper faq__style-4 tp-accordion">
                <div className="accordion" id={`${id}-${index + 1}_accordion`}>
                  {section.accordions.map((item, accordionIndex) => (
                    <SingleFaq
                      key={item.id}
                      item={{
                        ...item,
                        show: accordionIndex === 0,
                        parent: `${id}-${index + 1}_accordion`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const FaqArea = ({ element_faq = false }) => {
  const { lang } = useLanguage();
  const faqContent = sitePagesContent[lang]?.faq || sitePagesContent.tr.faq;

  return (
    <>
      <section className={`faq__area pt-100 pb-25 ${!element_faq ? "faq__area--standalone" : ""}`}>
        <div className="container">
          <div className="row">
            <div className="col-xxl-12">
              <div className="faq__tab-2 tp-tab mb-50">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  {faqContent.tabs.map((tab, index) => (
                    <li key={tab.id} className="nav-item" role="presentation">
                      <NavItem
                        active={index === 0}
                        id={tab.id}
                        icon={tabIcons[tab.id] || <General />}
                        title={tab.title}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="faq__item-wrapper">
            <div className="tab-content" id="faqTabContent">
              {faqContent.tabs.map((tab, index) => (
                <TabItem
                  key={tab.id}
                  active={index === 0}
                  id={tab.id}
                  sections={tab.sections}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FaqArea;

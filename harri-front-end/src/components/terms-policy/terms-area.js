'use client';

import { useLanguage } from "src/context/LanguageContext";
import { sitePagesContent } from "src/data/site-pages-content";

const TermsArea = () => {
  const { lang } = useLanguage();
  const terms = sitePagesContent[lang]?.terms || sitePagesContent.tr.terms;

  return (
    <section className="policy__area pb-120">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="policy__wrapper policy__translate p-relative z-index-1">
              <div className="policy__item mb-35">
                <h4 className="policy__meta">{terms.effectiveDate}</h4>
                <p>{terms.subtitle}</p>
              </div>

              {terms.sections.map((section) => (
                <div key={section.title} className="policy__item policy__item-2 mb-35">
                  <h3 className="policy__title">{section.title}</h3>
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets?.length ? (
                    <div className="policy__list mb-0">
                      <ul>
                        {section.bullets.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ))}

              <div className="policy__contact">
                <h3 className="policy__title policy__title-2">{terms.contactTitle}</h3>
                <p>{terms.contactIntro}</p>

                <ul>
                  <li>
                    E-mail:{" "}
                    <span>
                      <a href={`mailto:${terms.contactEmail}`}>{terms.contactEmail}</a>
                    </span>
                  </li>
                </ul>

                <div className="policy__address">
                  <p>
                    {terms.contactAddress.map((line) => (
                      <span key={line}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsArea;

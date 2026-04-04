'use client';
import React from "react";
import Link from "next/link";
import { useLanguage } from "src/context/LanguageContext";
import { getCheckoutSteps, getStepState } from "src/utils/checkout-steps";

const baseCircleStyle = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: 14,
  border: "1px solid #d9d9d9",
  backgroundColor: "#fff",
  color: "#777",
};

const CheckoutSteps = ({ currentStep = 1 }) => {
  const { lang } = useLanguage();
  const steps = getCheckoutSteps(lang);

  return (
    <section className="pt-25 pb-20">
      <div className="container">
        <div
          style={{
            border: "1px solid #ececec",
            borderRadius: 12,
            background: "#fff",
            padding: "16px 14px",
          }}
        >
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            {steps.map((step, idx) => {
              const state = getStepState(step.id, currentStep);
              const circleStyle =
                state === "active"
                  ? { ...baseCircleStyle, backgroundColor: "#6ea949", borderColor: "#6ea949", color: "#fff" }
                  : state === "done"
                    ? { ...baseCircleStyle, backgroundColor: "#f4faf0", borderColor: "#6ea949", color: "#2f7d32" }
                    : baseCircleStyle;

              const stepLabelStyle = {
                color: state === "active" ? "#1f2937" : "#666",
                fontWeight: 600,
                fontSize: 14,
              };

              return (
                <React.Fragment key={step.id}>
                  {step.href && state !== "active" ? (
                    <Link
                      href={step.href}
                      className="d-flex align-items-center gap-2"
                      style={{ textDecoration: "none", cursor: "pointer" }}
                    >
                      <span style={circleStyle}>{step.id}</span>
                      <span style={stepLabelStyle}>{step.label}</span>
                    </Link>
                  ) : (
                    <div className="d-flex align-items-center gap-2">
                      <span style={circleStyle}>{step.id}</span>
                      <span style={stepLabelStyle}>{step.label}</span>
                    </div>
                  )}
                  {idx < steps.length - 1 && (
                    <div
                      style={{
                        height: 1,
                        minWidth: 50,
                        flex: 1,
                        background: step.id < currentStep ? "#6ea949" : "#e5e7eb",
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckoutSteps;

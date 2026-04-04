export function getCheckoutSteps(lang = "tr") {
  const isTr = lang === "tr";
  return [
    { id: 1, label: isTr ? "Sepet" : "Cart", href: "/cart" },
    { id: 2, label: isTr ? "Ödeme" : "Checkout", href: "/checkout" },
    { id: 3, label: isTr ? "Onay" : "Confirmation", href: null },
  ];
}

export function getStepState(stepId, currentStep) {
  if (stepId < currentStep) return "done";
  if (stepId === currentStep) return "active";
  return "upcoming";
}

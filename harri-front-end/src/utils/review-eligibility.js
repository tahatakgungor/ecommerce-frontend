export function resolveReviewFormState({ user, eligibility, lang = "tr" }) {
  if (!user) {
    return {
      canSubmit: false,
      message: lang === "tr"
        ? "Yorum yazmak için giriş yapmalısınız."
        : "Please sign in to write a review.",
    };
  }

  if (!eligibility) {
    return {
      canSubmit: false,
      message: lang === "tr" ? "Yorum uygunluğu kontrol ediliyor..." : "Review eligibility is being checked...",
    };
  }

  if (eligibility.canReview) {
    return { canSubmit: true, message: null };
  }

  return {
    canSubmit: false,
    message: eligibility.reason || (lang === "tr"
      ? "Bu ürün için şu anda yorum yapamazsınız."
      : "You cannot review this product right now."),
  };
}

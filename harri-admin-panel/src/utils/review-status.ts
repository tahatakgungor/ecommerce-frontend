export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export function getReviewPageTitle(status: ReviewStatus): string {
  if (status === "APPROVED") return "Onaylanan Yorumlar";
  if (status === "REJECTED") return "Reddedilen Yorumlar";
  return "Bekleyen Yorumlar";
}


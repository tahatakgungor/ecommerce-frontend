import { buildReviewMediaFileName, getRemainingReviewMediaSlots, validateReviewMediaSelection } from "@/modules/reviews/media";

describe("review media helpers", () => {
  it("calculates remaining upload slots", () => {
    expect(getRemainingReviewMediaSlots([])).toBe(5);
    expect(getRemainingReviewMediaSlots(["1", "2"])).toBe(3);
    expect(getRemainingReviewMediaSlots(["1", "2", "3", "4", "5"])).toBe(0);
  });

  it("rejects oversized files", () => {
    const result = validateReviewMediaSelection(0, [
      {
        uri: "file://big.jpg",
        fileName: "big.jpg",
        fileSize: 9 * 1024 * 1024,
        mimeType: "image/jpeg",
      },
    ]);

    expect(result.ok).toBe(false);
  });

  it("keeps explicit filenames", () => {
    expect(
      buildReviewMediaFileName(
        {
          uri: "file://image.png",
          fileName: "sample.png",
          mimeType: "image/png",
        },
        0
      )
    ).toBe("sample.png");
  });
});

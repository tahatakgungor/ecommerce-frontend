import { buildBlogExcerpt, getBlogReadTime, normalizeBlogPost, splitBlogTextIntoParagraphs, stripHtmlTags } from "../src/modules/blog/utils";

describe("blog utils", () => {
  it("strips html tags into readable text", () => {
    expect(stripHtmlTags("<p>Merhaba <strong>dunya</strong></p>")).toBe("Merhaba dunya");
  });

  it("normalizes raw blog post payloads", () => {
    const post = normalizeBlogPost({
      id: "blog-1",
      title: "Mobil Blog",
      slug: "mobil-blog",
      contentHtml: "<p>Ilk paragraf.</p><p>Ikinci paragraf.</p>",
      relatedProductIds: ["p1"],
    });

    expect(post).toMatchObject({
      id: "blog-1",
      title: "Mobil Blog",
      slug: "mobil-blog",
      contentText: "Ilk paragraf. Ikinci paragraf.",
      relatedProductIds: ["p1"],
    });
  });

  it("builds excerpt from content when summary is absent", () => {
    expect(
      buildBlogExcerpt({
        summary: "",
        contentText: "A".repeat(200),
      }, 20)
    ).toBe(`${"A".repeat(20)}...`);
  });

  it("calculates read time and paragraph chunks", () => {
    expect(getBlogReadTime({ contentText: "kelime ".repeat(440) })).toBe(2);
    expect(splitBlogTextIntoParagraphs("Birinci cumle. Ikinci cumle. Ucuncu cumle.", 20).length).toBeGreaterThan(1);
  });
});

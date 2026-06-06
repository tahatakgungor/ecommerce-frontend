import type { BlogPost, RawBlogPost } from "@/modules/blog/types";

export function stripHtmlTags(html = "") {
  return String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function sanitizeBlogHtml(html = "") {
  const raw = String(html || "");
  if (!raw) return "";

  return raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\sstyle="[^"]*expression\([^"]*"/gi, "")
    .replace(/\shref="javascript:[^"]*"/gi, ' href="#"')
    .replace(/\ssrc="javascript:[^"]*"/gi, "")
    .trim();
}

export function buildBlogExcerpt(post: Pick<BlogPost, "summary" | "contentText">, maxLength = 170) {
  const summary = String(post.summary || "").trim();
  if (summary) return summary;
  const plain = String(post.contentText || "").trim();
  if (!plain) return "";
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}...`;
}

export function getBlogReadTime(post: Pick<BlogPost, "contentText">) {
  const plain = String(post.contentText || "").trim();
  if (!plain) return 1;
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function splitBlogTextIntoParagraphs(contentText: string, size = 360) {
  const text = String(contentText || "").trim();
  if (!text) return [];

  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const paragraphs: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (!current) {
      current = sentence;
      continue;
    }

    if (`${current} ${sentence}`.length > size) {
      paragraphs.push(current);
      current = sentence;
      continue;
    }

    current = `${current} ${sentence}`;
  }

  if (current) {
    paragraphs.push(current);
  }

  return paragraphs;
}

export function normalizeBlogPost(rawPost: RawBlogPost): BlogPost | null {
  const id = String(rawPost.id || rawPost._id || "").trim();
  const title = String(rawPost.title || "").trim();
  const slug = String(rawPost.slug || "").trim();
  if (!title || !slug) return null;

  const sanitizedHtml = sanitizeBlogHtml(rawPost.contentHtml || "");
  const contentText = stripHtmlTags(sanitizedHtml);

  return {
    id: id || slug,
    title,
    slug,
    summary: String(rawPost.summary || "").trim(),
    coverImage: rawPost.coverImage ? String(rawPost.coverImage).trim() : null,
    contentText,
    relatedProductIds: Array.isArray(rawPost.relatedProductIds) ? rawPost.relatedProductIds.map((item) => String(item || "").trim()).filter(Boolean) : [],
    publishedAt: String(rawPost.publishedAt || rawPost.updatedAt || rawPost.createdAt || ""),
    updatedAt: String(rawPost.updatedAt || rawPost.publishedAt || rawPost.createdAt || ""),
  };
}

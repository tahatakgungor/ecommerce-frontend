export function stripHtmlTags(html = "") {
  return String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function buildBlogExcerpt(post, maxLength = 170) {
  const summary = String(post?.summary || "").trim();
  if (summary) return summary;
  const plain = stripHtmlTags(post?.contentHtml || "");
  if (!plain) return "";
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trimEnd() + "...";
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

export function getBlogReadTime(post) {
  const plain = stripHtmlTags(post?.contentHtml || "");
  if (!plain) return 1;
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

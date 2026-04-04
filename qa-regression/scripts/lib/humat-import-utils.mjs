import path from "node:path";

const STOPWORDS = new Set([
  "ve", "ile", "for", "the", "bir", "urun", "ürün", "gida", "gıda", "takviyesi", "katkisi", "katkısı", "sivi", "sıvı",
  "ml", "lt", "l", "kg", "gr", "mg", "adet", "pack", "pc"
]);

export function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ıİ]/g, "i")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(value) {
  return normalizeText(value)
    .split(" ")
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

export function extractVolumeHints(value) {
  const normalized = normalizeText(value);
  const hints = [];
  const patterns = [
    /(\d+(?:\.\d+)?)\s*(l|litre|liter)\b/g,
    /(\d+(?:\.\d+)?)\s*(ml)\b/g,
    /(\d+(?:\.\d+)?)\s*(kg)\b/g,
    /(\d+(?:\.\d+)?)\s*(mg)\b/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(normalized))) {
      hints.push(`${m[1]}${m[2]}`);
    }
  }
  return hints;
}

export function similarityScore(imageName, productName) {
  const imageTokens = tokenize(imageName);
  const productTokens = tokenize(productName);
  if (imageTokens.length === 0 || productTokens.length === 0) return 0;

  const pset = new Set(productTokens);
  const overlap = imageTokens.filter((t) => pset.has(t));

  let score = overlap.length / new Set(imageTokens).size;

  const imageHints = extractVolumeHints(imageName);
  const productHints = extractVolumeHints(productName);
  if (imageHints.length > 0) {
    const hintOverlap = imageHints.filter((h) => productHints.includes(h));
    if (hintOverlap.length > 0) score += 0.4;
    else score -= 0.2;
  }

  const imageNorm = normalizeText(imageName);
  const productNorm = normalizeText(productName);
  if (productNorm.includes(imageNorm) || imageNorm.includes(productNorm)) {
    score += 0.3;
  }

  return score;
}

export function bestMatchForImage(imageFile, products, minScore = 0.34) {
  const imageBase = path.basename(imageFile, path.extname(imageFile));
  let best = null;
  for (const product of products) {
    const score = similarityScore(imageBase, product.name);
    if (!best || score > best.score) {
      best = { product, score };
    }
  }
  if (!best || best.score < minScore) return null;
  return best;
}

export function inferBrandFromName(name) {
  const n = normalizeText(name);
  if (n.startsWith("serravit") || n.includes("serravit")) return "SERRAVIT";
  if (n.startsWith("olvit") || n.includes("olvit")) return "OLVIT";
  if (n.startsWith("humata") || n.includes("humata") || n.startsWith("hum") || n.includes("humat")) return "HUMAT";
  return "HUMAT";
}

export function toSlugSku(title, index = 0) {
  const base = normalizeText(title)
    .replace(/[^a-z0-9\s]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 4)
    .join("-")
    .toUpperCase();
  return `SKU-${base || "ITEM"}-${String(index + 1).padStart(3, "0")}`;
}

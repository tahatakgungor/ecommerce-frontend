import test from "node:test";
import assert from "node:assert/strict";
import {
  bestMatchForImage,
  inferBrandFromName,
  normalizeText,
  similarityScore,
  toSlugSku,
} from "../scripts/lib/humat-import-utils.mjs";

test("normalizeText removes Turkish diacritics and punctuation", () => {
  assert.equal(normalizeText("SERRAVİT Humik Asit, Şurup 100 mL!"), "serravit humik asit surup 100 ml");
});

test("similarityScore rewards volume-aware matches", () => {
  const exact = similarityScore("HUMATA 12 (5 Litre)", "HUMATA 12 5 Litre");
  const wrongVolume = similarityScore("HUMATA 12 (5 Litre)", "HUMATA 12 20 Litre");
  assert.ok(exact > wrongVolume, `exact=${exact}, wrongVolume=${wrongVolume}`);
});

test("bestMatchForImage picks the most relevant product", () => {
  const products = [
    { name: "HUMATA 12 20 Litre" },
    { name: "HUMATA 12 5 Litre" },
    { name: "OLVIT Probiyotik 20 L" },
  ];
  const best = bestMatchForImage("/tmp/HUMATA 12 (5 Litre).jpg", products, 0.1);
  assert.ok(best);
  assert.equal(best.product.name, "HUMATA 12 5 Litre");
});

test("inferBrandFromName infers SERRAVIT and HUMAT families", () => {
  assert.equal(inferBrandFromName("SERRAVIT Humik Asit Sıvı 100mL"), "SERRAVIT");
  assert.equal(inferBrandFromName("OLVIT Probiyotik 20 L"), "OLVIT");
  assert.equal(inferBrandFromName("Humata Leo 25 kg"), "HUMAT");
});

test("toSlugSku builds deterministic compact SKU", () => {
  assert.equal(toSlugSku("SERRAVIT Humik Asit Gıda Takviyesi", 1), "SKU-SERRAVIT-HUMIK-ASIT-GIDA-002");
});

import { describe, expect, it } from "vitest";
import { normalizeSavedAddresses } from "../../src/utils/saved-addresses";

describe("normalizeSavedAddresses", () => {
  it("returns empty array for nullish input", () => {
    expect(normalizeSavedAddresses(null)).toEqual([]);
    expect(normalizeSavedAddresses(undefined)).toEqual([]);
    expect(normalizeSavedAddresses("")).toEqual([]);
  });

  it("accepts array payload as-is (without falsy items)", () => {
    const input = [{ id: "1", city: "Istanbul" }, null, { id: "2", city: "Ankara" }];
    expect(normalizeSavedAddresses(input)).toEqual([
      { id: "1", city: "Istanbul" },
      { id: "2", city: "Ankara" },
    ]);
  });

  it("parses JSON string payload", () => {
    const input = JSON.stringify([{ id: "1", label: "Ev" }]);
    expect(normalizeSavedAddresses(input)).toEqual([{ id: "1", label: "Ev" }]);
  });

  it("returns empty array for malformed JSON", () => {
    expect(normalizeSavedAddresses("{not-json}")).toEqual([]);
  });
});


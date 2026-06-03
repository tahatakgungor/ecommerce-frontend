import { describe, expect, it } from "vitest";
import {
  buildAdminListQueryParams,
  getAdminRangeLabel,
  normalizeAdminPage,
  normalizeAdminSize,
} from "../../src/utils/admin-list-query";

describe("admin list query helpers", () => {
  it("normalizes page and size values safely", () => {
    expect(normalizeAdminPage(undefined)).toBe(1);
    expect(normalizeAdminPage("3")).toBe(3);
    expect(normalizeAdminPage(0)).toBe(1);

    expect(normalizeAdminSize(undefined, 8)).toBe(8);
    expect(normalizeAdminSize("12", 8)).toBe(12);
    expect(normalizeAdminSize(-5, 8)).toBe(8);
  });

  it("builds list params without empty values", () => {
    expect(buildAdminListQueryParams({
      q: " humat ",
      status: "active",
      page: 2,
      size: 8,
      ignored: "",
      nullable: null,
    })).toEqual({
      q: "humat",
      status: "active",
      page: 2,
      size: 8,
    });
  });

  it("calculates the visible item range", () => {
    expect(getAdminRangeLabel(24, 2, 8, 8)).toEqual({ start: 9, end: 16 });
    expect(getAdminRangeLabel(3, 1, 8, 3)).toEqual({ start: 1, end: 3 });
    expect(getAdminRangeLabel(0, 1, 8, 0)).toEqual({ start: 0, end: 0 });
  });
});

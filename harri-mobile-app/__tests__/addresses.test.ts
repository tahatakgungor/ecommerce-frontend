import {
  normalizeSavedAddresses,
  removeSavedAddress,
  setDefaultAddress,
  upsertSavedAddress,
} from "../src/modules/profile/addresses";
import type { SavedAddress } from "../src/modules/auth/types";

const addressA: SavedAddress = {
  id: "a",
  label: "Ev",
  address: "Moda Caddesi 1",
  city: "Istanbul",
  country: "Kadikoy",
  zipCode: "34710",
  isDefault: true,
};

const addressB: SavedAddress = {
  id: "b",
  label: "Is",
  address: "Levent 10",
  city: "Istanbul",
  country: "Besiktas",
  zipCode: "34330",
  isDefault: false,
};

describe("saved address helpers", () => {
  it("normalizes serialized address arrays", () => {
    expect(normalizeSavedAddresses(JSON.stringify([addressA]))).toEqual([addressA]);
  });

  it("sets a new default address", () => {
    expect(setDefaultAddress([addressA, addressB], "b")).toEqual([
      { ...addressA, isDefault: false },
      { ...addressB, isDefault: true },
    ]);
  });

  it("upserts a default address and clears previous defaults", () => {
    expect(upsertSavedAddress([addressA], { ...addressB, isDefault: true })).toEqual([
      { ...addressA, isDefault: false },
      { ...addressB, isDefault: true },
    ]);
  });

  it("keeps at least one default after removal", () => {
    expect(removeSavedAddress([addressA, addressB], "a")).toEqual([{ ...addressB, isDefault: true }]);
  });
});

import { describe, it, expect } from "vitest";
import { mapAdditionalServices } from "../map-additional-services";
import { AdditionalServices } from "@/types/generated/ExperienceRawServiceApi";

describe("mapAdditionalServices", () => {
  it("should return updated values when they are present", () => {
    const initialValues: AdditionalServices = [
      "BRAND_TUI_COLLECTION",
      "PROMOTIONAL_LIKELY_TO_SELL_OUT",
      "NAT_GEO_TOUR_LEVEL_1",
    ];
    const updatedValues: AdditionalServices = ["BRAND_NEW_COLLECTION", "PROMOTIONAL_NEW_OFFER"];

    const result = mapAdditionalServices(initialValues, updatedValues);

    expect(result).toEqual(["BRAND_NEW_COLLECTION", "PROMOTIONAL_NEW_OFFER", "NAT_GEO_TOUR_LEVEL_1"]);
  });

  it("should return initial values when updated values are not present", () => {
    const initialValues: AdditionalServices = [
      "BRAND_TUI_COLLECTION",
      "PROMOTIONAL_LIKELY_TO_SELL_OUT",
      "NAT_GEO_TOUR_LEVEL_1",
    ];
    const updatedValues: AdditionalServices = [];

    const result = mapAdditionalServices(initialValues, updatedValues);

    expect(result).toEqual(["BRAND_TUI_COLLECTION", "PROMOTIONAL_LIKELY_TO_SELL_OUT", "NAT_GEO_TOUR_LEVEL_1"]);
  });

  it("should return an empty array when neither initial nor updated values are present", () => {
    const initialValues: AdditionalServices = [];
    const updatedValues: AdditionalServices = [];

    const result = mapAdditionalServices(initialValues, updatedValues);

    expect(result).toEqual([]);
  });

  it("should merge initial and updated values correctly", () => {
    const initialValues: AdditionalServices = ["BRAND_TUI_COLLECTION", "PROMOTIONAL_LIKELY_TO_SELL_OUT"];
    const updatedValues: AdditionalServices = ["NAT_GEO_TOUR_LEVEL_1", "OWN_OFFER_SPECIAL"];

    const result = mapAdditionalServices(initialValues, updatedValues);

    expect(result).toEqual([
      "BRAND_TUI_COLLECTION",
      "PROMOTIONAL_LIKELY_TO_SELL_OUT",
      "NAT_GEO_TOUR_LEVEL_1",
      "OWN_OFFER_SPECIAL",
    ]);
  });
});

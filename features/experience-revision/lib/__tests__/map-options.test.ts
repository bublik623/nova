import { describe, expect, test } from "vitest";
import { RevisionOptions } from "../../types/revision";
import { computeExperienceOptions } from "../map-options";

describe("mapCurationOptions", () => {
  test("should return empty options when productBrand is not BRAND_NATIONAL_GEOGRAPHIC", () => {
    const values = {
      productBrand: "OTHER_BRAND",
    };

    const options: RevisionOptions = {};

    expect(computeExperienceOptions(values)).toEqual(options);
  });

  test("should return options with showNatGeoField set to true when productBrand is BRAND_NATIONAL_GEOGRAPHIC", () => {
    const values = {
      productBrand: "BRAND_NATIONAL_GEOGRAPHIC",
    };

    const options: RevisionOptions = {
      showNatGeoField: true,
    };

    expect(computeExperienceOptions(values)).toEqual(options);
  });
});

import { describe, test, expect, vi } from "vitest";
import { computeOptionsByFlow } from "../compute-options-by-flow";
import { computeExperienceOptions } from "@/features/experience-revision/lib/map-options";

vi.mock("@/features/experience-revision/lib/map-options");

describe("computeOptionsByFlow", () => {
  test("should return options mapped by curation flow", () => {
    const options = {
      showAsterix: true,
      showNatGeoField: true,
    };
    const flow = "curation";
    const values = {
      productBrand: "OTHER_BRAND",
    };

    // @ts-ignore mocked return
    computeExperienceOptions.mockReturnValue(options);

    const result = computeOptionsByFlow(flow, values);

    expect(computeExperienceOptions).toHaveBeenCalledWith(values);
    expect(result).toStrictEqual(options);
  });

  test("should return options mapped by raw flow", () => {
    const options = {
      showAsterix: true,
      showNatGeoField: true,
    };
    const flow = "raw";
    const values = {
      productBrand: "OTHER_BRAND",
    };

    // @ts-ignore mocked return
    computeExperienceOptions.mockReturnValue(options);

    const result = computeOptionsByFlow(flow, values);

    expect(computeExperienceOptions).toHaveBeenCalledWith(values);
    expect(result).toStrictEqual(options);
  });

  test("should throw an error for invalid flow", () => {
    const flow = "invalid";
    const values = {
      productBrand: "OTHER_BRAND",
    };

    expect(() => {
      computeOptionsByFlow(flow, values);
    }).toThrowErrorMatchingInlineSnapshot(`[Error: Could not compute options for flow: invalid]`);
  });
});

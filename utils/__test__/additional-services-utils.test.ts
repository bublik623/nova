import { describe, test, expect, vi, afterAll } from "vitest";
import {
  ExperienceFunctionalGroupFields,
  mapCodesToAdditionalServices,
  getSelectedAdditionalServices,
} from "../additional-services-utils";

describe("mapCodesToAdditionalServices", () => {
  test("maps fields values to an array", () => {
    const fields: ExperienceFunctionalGroupFields = {
      product_brand: { value: "TUI_BRAND", category: "a" },
      own_offer: { value: "OFFER_EX", category: "a" },
      promotional_options: { value: "OPTIONS_EX", category: "a" },
      features: { value: ["FEATURE-1", "FEATURE-2"], category: "a" },
      additional_services: {
        value: ["DURATION_1", "DURATION_2"],
        category: "a",
      },
      nat_geo_tour_levels: { value: "LEVEL_TEST", category: "a" },
    };

    const result = mapCodesToAdditionalServices(fields);

    const expected = [
      "TUI_BRAND",
      "OFFER_EX",
      "OPTIONS_EX",
      "LEVEL_TEST",
      "FEATURE-1",
      "FEATURE-2",
      "DURATION_1",
      "DURATION_2",
    ];
    expect(result).toEqual(expected);
  });

  test("filters out empty strings", () => {
    const fields: ExperienceFunctionalGroupFields = {
      product_brand: { value: "TUI_BRAND", category: "a" },
      own_offer: { value: "", category: "a" },
      promotional_options: { value: "", category: "a" },
      features: { value: [""], category: "a" },
      additional_services: {
        value: ["DURATION_1", ""],
        category: "a",
      },
      nat_geo_tour_levels: { value: "", category: "a" },
    };

    const result = mapCodesToAdditionalServices(fields);

    const expected = ["TUI_BRAND", "DURATION_1"];
    expect(result).toEqual(expected);
  });
});

describe("getSelectedAdditionalServices", () => {
  vi.mock("@/stores/master-data", () => ({
    useMasterData: () => ({
      getAdditionalServicesByFGCode(code: string) {
        switch (code) {
          case "DURATION":
            return [{ code: "2_4_HOURS" }, { code: "ANOTHER_CODE" }];
          case "PRODUCT_BRAND":
            return [{ code: "BRAND_SCENE" }];
          default:
            return [];
        }
      },
    }),
  }));

  afterAll(() => {
    vi.restoreAllMocks();
  });

  test("returns selected additional service code(s) for a multi type additional service group", () => {
    const additionalServiceCodes = ["2_4_HOURS", "ANOTHER_CODE", "BRAND_SCENE"];

    const result = getSelectedAdditionalServices("DURATION", additionalServiceCodes, true);

    const expected = ["2_4_HOURS", "ANOTHER_CODE"];
    expect(result).toEqual(expected);
  });

  test("returns selected additional service code for a single type additional service group", () => {
    const additionalServiceCodes = ["2_4_HOURS", "ANOTHER_CODE", "BRAND_SCENE"];

    const result = getSelectedAdditionalServices("PRODUCT_BRAND", additionalServiceCodes, false);

    const expected = "BRAND_SCENE";
    expect(result).toEqual(expected);
  });

  test("returns an empty string for single type additional service group with no selected option", () => {
    const additionalServiceCodes = ["2_4_HOURS", "ANOTHER_CODE"];

    const result = getSelectedAdditionalServices("PRODUCT_BRAND", additionalServiceCodes, false);

    const expected = "";
    expect(result).toEqual(expected);
  });
});

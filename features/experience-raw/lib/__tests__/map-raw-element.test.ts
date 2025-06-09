import { describe, expect, test, vi } from "vitest";
import { mapRawElementToRawSettingsValue, mapRawSettingsValueToRawElement } from "../map-raw-element";
import * as utilsMock from "@/utils/additional-services-utils";
import * as mapAdditionalServicesMock from "@/features/experience-raw/lib/map-additional-services";
import { RawElement } from "@/types/generated/ExperienceRawServiceApi";

const addServiceSpy = vi.spyOn(utilsMock, "getSelectedAdditionalServices").mockImplementation(() => "Test Service");
const mapAdditionalServicesSpy = vi
  .spyOn(mapAdditionalServicesMock, "mapAdditionalServices")
  .mockImplementation(() => ["Test Service"]);

describe("MapRawElement", () => {
  test("It should map a raw element to the settings data", () => {
    const rawElement = {
      commercial: {
        title: "Title",
      },
      functional: {
        external_reference_code: "External Reference Code",
        categories: ["Category 1", "Category 2"],
        interests: ["Interest 1", "Interest 2"],
      },
      collection_criteria: {
        best_value_guaranteed: "Best Value Guaranteed",
        created_with_care: "Created With Care",
        exceptional_experiences: "Exceptional Experiences",
      },
    };
    const expected = {
      title: "Title",
      external_reference_code: "External Reference Code",
      categories_interests: {
        categories: ["Category 1", "Category 2"],
        interests: ["Interest 1", "Interest 2"],
      },
      collection_criteria: {
        best_value_guaranteed: "Best Value Guaranteed",
        created_with_care: "Created With Care",
        exceptional_experiences: "Exceptional Experiences",
      },
      product_brand: "Test Service",
      own_offer: "Test Service",
      nat_geo_tour_levels: "Test Service",
      promotional_options: "Test Service",
    };
    const result = mapRawElementToRawSettingsValue(rawElement as RawElement);
    expect(result).toEqual(expected);
    expect(addServiceSpy).toHaveBeenCalledTimes(4);
  });

  test("it should map settings data to a raw element", () => {
    const rawSettings = {
      title: "Title",
      external_reference_code: "External Reference Code",
      categories_interests: {
        categories: ["Category 1", "Category 2"],
        interests: ["Interest 1", "Interest 2"],
      },
      collection_criteria: {
        best_value_guaranteed: "Best Value Guaranteed",
        created_with_care: "Created With Care",
        exceptional_experiences: undefined,
      },
      product_brand: "BRAND_3",
    };

    const result = mapRawSettingsValueToRawElement(rawSettings, {
      additional_services: ["BRAND_2", "FEATURE_1"],
    });

    expect(mapAdditionalServicesSpy).toHaveBeenCalledWith(["BRAND_2", "FEATURE_1"], ["BRAND_3"]);

    expect(result).toMatchInlineSnapshot(`
      {
        "collection_criteria": {
          "best_value_guaranteed": "Best Value Guaranteed",
          "created_with_care": "Created With Care",
          "exceptional_experiences": undefined,
        },
        "commercial": {
          "title": "Title",
        },
        "functional": {
          "additional_services": [
            "Test Service",
          ],
          "categories": [
            "Category 1",
            "Category 2",
          ],
          "external_reference_code": "External Reference Code",
          "interests": [
            "Interest 1",
            "Interest 2",
          ],
        },
      }
    `);
  });
});

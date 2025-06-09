import { describe, it, expect } from "vitest";
import { getExperienceRawInitialValues, isDisabledDuringCuration } from "../experience-raw-utils";
import { RawElement } from "@/types/generated/ExperienceRawServiceApi";
import { RawStatusCode } from "@/types/DocumentStatuses";

describe("Experience Raw Utils", () => {
  describe("getExperienceRawInitialValues", () => {
    it("should return initial values when no overrides are provided", () => {
      const initialValues = getExperienceRawInitialValues({});
      const expectedValues: RawElement = {
        functional: {
          asterix_id: "",
          options: [],
          highlights: [],
          included: [],
          non_included: [],
          important_information: [],
          additional_services: [],
          categories: [],
          interests: [],
          external_reference_code: "",
        },
        commercial: {
          title: "",
          description: "",
          additional_description: "",
          info_voucher: "",
          meeting_point_details: "",
          custom_highlights: [],
          custom_included: [],
          custom_non_included: [],
          custom_important_information: [],
        },
        experience_id: "",
      };

      expect(initialValues).toMatchObject(expectedValues);
    });

    it("should merge overrides with initial values", () => {
      const overrides: Partial<RawElement> = {
        functional: {
          highlights: ["one"],
        },
      };

      const initialValues = getExperienceRawInitialValues(overrides);

      expect(initialValues).toMatchObject({
        functional: {
          highlights: ["one"],
        },
      });
    });
  });

  describe("isDisabledDuringCuration", () => {
    it("should return true if the field is a commercial field and the experience is being curated", () => {
      const result = isDisabledDuringCuration("title", RawStatusCode.BEING_CURATED);
      expect(result).toBe(true);
    });

    it("should return false if the field is not a commercial field", () => {
      const result = isDisabledDuringCuration("nonCommercialField", RawStatusCode.BEING_CURATED);
      expect(result).toBe(false);
    });

    it("should return false if the experience is not being curated", () => {
      const result = isDisabledDuringCuration("title", RawStatusCode.UP_TO_DATE);
      expect(result).toBe(false);
    });
  });
});

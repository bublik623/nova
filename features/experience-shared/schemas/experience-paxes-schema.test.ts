import { describe, expect, test } from "vitest";
import { experiencePaxesSchema } from "./experience-paxes-schema";

describe("validateAgeRange", () => {
  describe("when all_ages is false", () => {
    test("should pass when age_from is less than age_to", () => {
      const result = experiencePaxesSchema.safeParse({
        experience_id: "test-id",
        pax_list: [
          {
            pax_code: "adult",
            pax_type: "PERSON",
            all_ages: false,
            age_from: 18,
            age_to: 65,
            free_of_charge: false,
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    test("should fail when age_from is greater than age_to", () => {
      const result = experiencePaxesSchema.safeParse({
        experience_id: "test-id",
        pax_list: [
          {
            pax_code: "adult",
            pax_type: "PERSON",
            all_ages: false,
            age_from: 65,
            age_to: 18,
            free_of_charge: false,
          },
        ],
      });

      expect(result.success).toBe(false);
    });
  });

  describe("when all_ages is true", () => {
    test("should pass with null age values", () => {
      const result = experiencePaxesSchema.safeParse({
        experience_id: "test-id",
        pax_list: [
          {
            pax_code: "adult",
            pax_type: "PERSON",
            all_ages: true,
            age_from: null,
            age_to: null,
            free_of_charge: false,
          },
        ],
      });

      expect(result.success).toBe(true);
    });
  });
});

describe("validatePaxOverlaps", () => {
  describe("when multiple pax types are defined", () => {
    test("should pass when age ranges don't overlap", () => {
      const result = experiencePaxesSchema.safeParse({
        experience_id: "test-id",
        pax_list: [
          {
            pax_code: "adult",
            pax_type: "PERSON",
            all_ages: false,
            age_from: 18,
            age_to: 65,
            free_of_charge: false,
          },
          {
            pax_code: "child",
            pax_type: "PERSON",
            all_ages: false,
            age_from: 5,
            age_to: 17,
            free_of_charge: false,
          },
          {
            pax_code: "infant",
            pax_type: "PERSON",
            all_ages: false,
            age_from: 0,
            age_to: 4,
            free_of_charge: false,
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    test("should fail when age ranges overlap", () => {
      const result = experiencePaxesSchema.safeParse({
        experience_id: "test-id",
        pax_list: [
          {
            pax_code: "adult",
            pax_type: "PERSON",
            all_ages: false,
            age_from: 18,
            age_to: 65,
            free_of_charge: false,
          },
          {
            pax_code: "child",
            pax_type: "PERSON",
            all_ages: false,
            age_from: 16,
            age_to: 25,
            free_of_charge: false,
          },
        ],
      });

      expect(result.success).toBe(false);
      if (result.success) return;

      const errors = result.error.issues;
      expect(errors).toHaveLength(3);

      // child age_from should have an error
      expect(errors[0].message).toBe('overlaps with "child"');
      expect(errors[0].path).toEqual(["pax_list", 0, "age_from"]);
      // adult age_to should have an error
      expect(errors[1].message).toBe('overlaps with "adult"');
      expect(errors[1].path).toEqual(["pax_list", 1, "age_to"]);
      // assert that there is a root level error
      expect(errors[2].message).toBe("overlap");
      expect(errors[2].path).toEqual(["pax_list"]);
    });

    test("should pass when one pax has all_ages true", () => {
      const result = experiencePaxesSchema.safeParse({
        experience_id: "test-id",
        pax_list: [
          {
            pax_code: "adult",
            pax_type: "PERSON",
            all_ages: false,
            age_from: 18,
            age_to: 65,
            free_of_charge: false,
          },
          {
            pax_code: "child",
            pax_type: "PERSON",
            all_ages: true,
            age_from: undefined,
            age_to: undefined,
            free_of_charge: false,
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    test("should fail when age ranges touch boundaries", () => {
      const result = experiencePaxesSchema.safeParse({
        experience_id: "test-id",
        pax_list: [
          {
            pax_code: "adult",
            pax_type: "PERSON",
            all_ages: false,
            age_from: 18,
            age_to: 65,
            free_of_charge: false,
          },
          {
            pax_code: "child",
            pax_type: "PERSON",
            all_ages: false,
            age_from: 13,
            age_to: 19,
            free_of_charge: false,
          },
        ],
      });

      expect(result.success).toBe(false);
      if (result.success) return;

      const errors = result.error.issues;
      expect(errors).toHaveLength(3);

      // child age_from should have an error
      expect(errors[0].message).toBe('overlaps with "child"');
      expect(errors[0].path).toEqual(["pax_list", 0, "age_from"]);
      // adult age_to should have an error
      expect(errors[1].message).toBe('overlaps with "adult"');
      expect(errors[1].path).toEqual(["pax_list", 1, "age_to"]);
      // assert that there is a root level error
      expect(errors[2].message).toBe("overlap");
      expect(errors[2].path).toEqual(["pax_list"]);
    });

    test("should pass when overlapping age ranges include a skipped pax code (eg: student)", () => {
      const result = experiencePaxesSchema.safeParse({
        experience_id: "test-id",
        pax_list: [
          {
            pax_code: "adult",
            pax_type: "PERSON",
            all_ages: false,
            age_from: 18,
            age_to: 65,
            free_of_charge: false,
          },
          {
            pax_code: "student",
            pax_type: "PERSON",
            all_ages: false,
            age_from: 16,
            age_to: 25,
            free_of_charge: false,
          },
        ],
      });

      // This should pass even though the "student" age range (16-25) overlaps with "adult" (18-65)
      // because "student" is in the paxCodesToSkipOverlapCheck list
      expect(result.success).toBe(true);
    });
  });
});

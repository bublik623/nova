import { describe, it, expect } from "vitest";
import { ZodIssueCode } from "zod";
import { optionSchema, optionArraySchema, ValidationErrors } from "./option-schema";
import type { Option } from "./types";

const validOption1: Option = {
  id: "opt1",
  title: "Standard Option 1",
  code: "STD01",
  duration: 60,
  subchannels: ["web", "mobile"],
  paxTypes: ["adult", "child"],
};

const validOption2: Option = {
  id: "opt2",
  title: "Express Option 2",
  code: "EXP02",
  duration: 30,
  subchannels: "all",
  paxTypes: "all",
};

const validOption3: Option = {
  id: "opt3",
  title: "Deluxe Option 3",
  code: "DLX03",
  duration: 120,
  subchannels: ["kiosk"],
  paxTypes: ["senior"],
};

describe("Feature: Option Validation Logic", () => {
  describe("Scenario: Validating a Single Option (OptionValidationSchema)", () => {
    it("Given a complete and correct option, when validated, then it should succeed", () => {
      const result = optionSchema.safeParse(validOption1);
      expect(result.success).toBe(true);
    });

    it('Given a valid option using "all" for arrays, when validated, then it should succeed', () => {
      const result = optionSchema.safeParse(validOption2);
      expect(result.success).toBe(true);
    });

    it("Given an option with an empty title, when validated, then it should fail reporting the title is too short", () => {
      const invalidOption = { ...validOption1, title: "" };
      const result = optionSchema.safeParse(invalidOption);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual([
          expect.objectContaining({
            code: ZodIssueCode.too_small,
            path: ["title"],
          }),
        ]);
      }
    });

    it("Given an option with an empty code, when validated, then it should fail reporting the code is too short", () => {
      const invalidOption = { ...validOption1, code: "" };
      const result = optionSchema.safeParse(invalidOption);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual([
          expect.objectContaining({
            code: ZodIssueCode.too_small,
            path: ["code"],
          }),
        ]);
      }
    });

    it("Given an option with zero duration, when validated, then it should fail reporting the duration is too small", () => {
      const invalidOption = { ...validOption1, duration: 0 };
      const result = optionSchema.safeParse(invalidOption);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual([
          expect.objectContaining({
            code: ZodIssueCode.too_small,
            path: ["duration"],
          }),
        ]);
      }
    });

    it("Given an option with negative duration, when validated, then it should fail reporting the duration is too small", () => {
      const invalidOption = { ...validOption1, duration: -10 };
      const result = optionSchema.safeParse(invalidOption);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual([
          expect.objectContaining({
            code: ZodIssueCode.too_small,
            path: ["duration"],
          }),
        ]);
      }
    });

    it("Given an option with an empty subchannels array, when validated, then it should fail reporting the array is too small", () => {
      const invalidOption = { ...validOption1, subchannels: [] };
      const result = optionSchema.safeParse(invalidOption);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Error is 'too_small' because the *inner* array `.min(1)` constraint failed
        expect(result.error.issues).toEqual([
          expect.objectContaining({
            code: ZodIssueCode.too_small,
            minimum: 1,
            type: "array",
            path: ["subchannels"], // Error applies to the 'subchannels' field itself
          }),
        ]);
      }
    });

    it("Given an option with subchannels containing an empty string, when validated, then it should fail reporting the string is too short", () => {
      const invalidOption = { ...validOption1, subchannels: ["web", ""] };
      const result = optionSchema.safeParse(invalidOption);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual([
          expect.objectContaining({
            code: ZodIssueCode.too_small,
            path: ["subchannels", 1], // Path to the empty string element
          }),
        ]);
      }
    });

    it("Given an option with an empty paxTypes array, when validated, then it should fail reporting the array is too small", () => {
      const invalidOption = { ...validOption1, paxTypes: [] };
      const result = optionSchema.safeParse(invalidOption);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Error is 'too_small' because the *inner* array `.min(1)` constraint failed
        expect(result.error.issues).toEqual([
          expect.objectContaining({
            code: ZodIssueCode.too_small,
            minimum: 1,
            type: "array",
            path: ["paxTypes"], // Error applies to the 'paxTypes' field itself
          }),
        ]);
      }
    });

    it("Given an option with paxTypes containing an empty string, when validated, then it should fail reporting the string is too short", () => {
      const invalidOption = { ...validOption1, paxTypes: ["adult", ""] };
      const result = optionSchema.safeParse(invalidOption);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual([
          expect.objectContaining({
            code: ZodIssueCode.too_small,
            path: ["paxTypes", 1], // Path to the empty string element
          }),
        ]);
      }
    });
  });

  describe("Scenario: Validating a List of Options (OptionsValidationSchema)", () => {
    it("Given an empty list of options, when validated, then it should fail reporting the array is too small", () => {
      const options: Option[] = [];
      const result = optionArraySchema.safeParse(options);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Error is 'too_small' because the root array `.min(1)` constraint failed
        expect(result.error.issues).toEqual([
          expect.objectContaining({
            code: ZodIssueCode.too_small,
            minimum: 1,
            type: "array",
            path: [], // Empty path array means the error is on the root schema (the array itself)
          }),
        ]);
      }
    });

    it("Given a list of valid and unique options, when validated, then it should succeed", () => {
      const options = [validOption1, validOption2, validOption3];
      const result = optionArraySchema.safeParse(options);
      expect(result.success).toBe(true);
    });

    it("Given a list containing one invalid option, when validated, then it should fail reporting the specific field error", () => {
      const invalidOption = { ...validOption1, duration: 0 };
      const options = [validOption2, invalidOption, validOption3];
      const result = optionArraySchema.safeParse(options);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toEqual([
          expect.objectContaining({
            code: ZodIssueCode.too_small,
            path: [1, "duration"],
          }),
        ]);
      }
    });

    describe("Context: Uniqueness Constraints", () => {
      it("Given a list where two options have the same code, when validated, then it should fail reporting duplicate codes for both items", () => {
        const options = [validOption1, { ...validOption2, code: "STD01" }, validOption3];
        const result = optionArraySchema.safeParse(options);
        expect(result.success).toBe(false);
        if (!result.success) {
          const codeIssues = result.error.issues.filter(
            (issue) => issue.params?.errorCode === ValidationErrors.DUPLICATE_CODE
          );
          expect(codeIssues).toHaveLength(2);
          // Use arrayContaining as error order isn't guaranteed for multiple errors
          expect(codeIssues).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                code: ZodIssueCode.custom,
                path: [0, "code"],
                params: expect.objectContaining({ errorCode: ValidationErrors.DUPLICATE_CODE }),
              }),
              expect.objectContaining({
                code: ZodIssueCode.custom,
                path: [1, "code"],
                params: expect.objectContaining({ errorCode: ValidationErrors.DUPLICATE_CODE }),
              }),
            ])
          );
        }
      });

      it("Given a list where two options have the same title, when validated, then it should fail reporting duplicate titles for both items", () => {
        const options = [validOption1, validOption2, { ...validOption3, title: "Standard Option 1" }];
        const result = optionArraySchema.safeParse(options);
        expect(result.success).toBe(false);
        if (!result.success) {
          const titleIssues = result.error.issues.filter(
            (issue) => issue.params?.errorCode === ValidationErrors.DUPLICATE_TITLE
          );
          expect(titleIssues).toHaveLength(2);
          // Use arrayContaining as error order isn't guaranteed
          expect(titleIssues).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                code: ZodIssueCode.custom,
                path: [0, "title"],
                params: expect.objectContaining({ errorCode: ValidationErrors.DUPLICATE_TITLE }),
              }),
              expect.objectContaining({
                code: ZodIssueCode.custom,
                path: [2, "title"],
                params: expect.objectContaining({ errorCode: ValidationErrors.DUPLICATE_TITLE }),
              }),
            ])
          );
        }
      });

      it("Given a list with both duplicate codes and duplicate titles, when validated, then it should fail reporting all duplications", () => {
        const options = [
          validOption1,
          { ...validOption2, code: "STD01" },
          { ...validOption3, title: "Express Option 2" },
        ];
        const result = optionArraySchema.safeParse(options);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toHaveLength(4);

          const codeIssues = result.error.issues.filter(
            (issue) => issue.params?.errorCode === ValidationErrors.DUPLICATE_CODE
          );
          const titleIssues = result.error.issues.filter(
            (issue) => issue.params?.errorCode === ValidationErrors.DUPLICATE_TITLE
          );

          expect(codeIssues).toHaveLength(2);
          expect(titleIssues).toHaveLength(2);

          // Use arrayContaining as error order isn't guaranteed
          expect(codeIssues).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ path: [0, "code"] }),
              expect.objectContaining({ path: [1, "code"] }),
            ])
          );
          // Use arrayContaining as error order isn't guaranteed
          expect(titleIssues).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ path: [1, "title"] }),
              expect.objectContaining({ path: [2, "title"] }),
            ])
          );
        }
      });

      it("Given a list with both standard field errors and uniqueness errors, when validated, then it should fail reporting all errors", () => {
        const options = [validOption1, { ...validOption2, code: "STD01", duration: 0 }, validOption3];
        const result = optionArraySchema.safeParse(options);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toHaveLength(3);

          // Check standard duration error is present somewhere in the list
          expect(result.error.issues).toEqual(
            expect.arrayContaining([expect.objectContaining({ code: ZodIssueCode.too_small, path: [1, "duration"] })])
          );

          // Check duplicate code errors are present
          const codeIssues = result.error.issues.filter(
            (issue) => issue.params?.errorCode === ValidationErrors.DUPLICATE_CODE
          );
          expect(codeIssues).toHaveLength(2);
          // Use arrayContaining for the filtered subset as order isn't guaranteed
          expect(codeIssues).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ path: [0, "code"] }),
              expect.objectContaining({ path: [1, "code"] }),
            ])
          );
        }
      });
    });
  });
});

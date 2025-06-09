import { describe, expect, test } from "vitest";
import { z } from "zod";
import { useGenericValidation } from "../useGenericValidation";

const testSchema = z.object({
  string: z.string().min(1),
  number: z.number(),
  optional: z.string().optional(),
  array: z.array(z.string().min(1)),
});

describe("useGenericValidation", () => {
  test("it should correctly validate an object", () => {
    const testValues = {
      string: "test",
      number: 1,
      array: ["test-1", "test-2", "test-3"],
    };

    const { runValidation, errors } = useGenericValidation(testSchema);
    runValidation(testValues);

    expect(errors.value).toStrictEqual(null);
  });

  test("it should return errors if the validation fails", () => {
    const testValues = {
      string: "",
    };

    const { runValidation, errors } = useGenericValidation(testSchema);
    runValidation(testValues);

    expect((errors.value as any).string).toStrictEqual({
      _errors: ["String must contain at least 1 character(s)"],
    });
  });

  describe("getError", () => {
    test("it should return the correct error based on the path", () => {
      const testValues = {
        string: "",
      };

      const { runValidation, getError } = useGenericValidation(testSchema);
      runValidation(testValues);

      expect(getError("string")).toStrictEqual({
        _errors: ["String must contain at least 1 character(s)"],
      });
      expect(getError("number")).toStrictEqual({ _errors: ["Required"] });
    });

    describe("when there are no errors", () => {
      test("it should return an empty object", () => {
        const testValues = {
          string: "test",
          number: 1,
          array: ["test-1", "test-2", "test-3"],
        };

        const { runValidation, getError } = useGenericValidation(testSchema);
        runValidation(testValues);

        expect(getError("string")).toStrictEqual({});
      });
    });
  });

  describe("hasError", () => {
    test("it should return true if there is an error based on the path", () => {
      const testValues = {
        string: "",
      };

      const { runValidation, hasError } = useGenericValidation(testSchema);
      runValidation(testValues);

      expect(hasError("string")).toBe(true);
      expect(hasError("number")).toBe(true);
      expect(hasError("optional")).toBe(false);
      expect(hasError("not-existing")).toBe(false);
    });
  });
});

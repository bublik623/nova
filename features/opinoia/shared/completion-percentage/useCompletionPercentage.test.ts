import { describe, expect, test } from "vitest";
import { Field, useCompletionPercentage } from "./useCompletionPercentage";

describe("useCompletionPercentage", () => {
  test("it returns zero when there are no required fields", () => {
    const fields: Field[] = [
      { isRequired: false, isValid: true },
      { isRequired: false, isValid: false },
    ];

    const completionPercentage = useCompletionPercentage(ref(fields));

    expect(completionPercentage.value).toBe(0);
  });

  test("it returns the percentage (rounded to the nearest integer) of the valid required fields over the total number of required fields", () => {
    const fields: Field[] = [
      { isRequired: true, isValid: true },
      { isRequired: true, isValid: false },
      { isRequired: true, isValid: true },
      { isRequired: false, isValid: true },
    ];

    const completionPercentage = useCompletionPercentage(ref(fields));

    expect(completionPercentage.value).toBe(67);
  });

  test("it returns 100 when all of the required fields are valid", () => {
    const fields: Field[] = [
      { isRequired: true, isValid: true },
      { isRequired: true, isValid: true },
      { isRequired: true, isValid: true },
      { isRequired: false, isValid: false },
    ];

    const completionPercentage = useCompletionPercentage(ref(fields));

    expect(completionPercentage.value).toBe(100);
  });
});

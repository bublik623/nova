import { describe, expect, test } from "vitest";
import { fieldValidator } from "@/utils/field-validator";
import { FormField } from "@/types/Form";

describe("FieldValidator", () => {
  test("it should validate a valid simple field", () => {
    const stringField: FormField<string, false> = {
      category: "custom category",
      value: "my valid value",
    };

    const numberField: FormField<number, false> = {
      category: "custom category",
      value: 42,
    };

    const arrayField: FormField<string[], false> = {
      category: "custom category",
      value: ["my valid value"],
    };

    expect(fieldValidator(stringField)).toBe(true);
    expect(fieldValidator(numberField)).toBe(true);
    expect(fieldValidator(arrayField)).toBe(true);
  });

  test("it should not validate an invalid simple field", () => {
    const stringField: FormField<string, false> = {
      category: "custom category",
      value: "",
    };

    const numberField: FormField<number | undefined, false> = {
      category: "custom category",
      value: undefined,
    };

    const arrayField: FormField<string[], false> = {
      category: "custom category",
      value: [],
    };

    expect(fieldValidator(stringField)).toBe(false);
    expect(fieldValidator(numberField)).toBe(false);
    expect(fieldValidator(arrayField)).toBe(false);
  });

  test("it should validate a valid complex field with a custom validator", () => {
    const objectField: FormField<
      {
        myProperty: boolean;
      },
      false
    > = {
      category: "custom category",
      value: {
        myProperty: true,
      },
      validator: (value) => {
        return value.myProperty;
      },
    };
    const arrayField: FormField<number[], false> = {
      category: "custom category",
      value: [3, 5, 13],
      validator: (value) => {
        return value[0] + value[1] + value[2] === 21;
      },
    };

    expect(fieldValidator(objectField)).toBe(true);
    expect(fieldValidator(arrayField)).toBe(true);
  });

  test("it should not validate a complex field with a custom validator", () => {
    const objectField: FormField<
      {
        myProperty: boolean;
      },
      false
    > = {
      category: "custom category",
      value: {
        myProperty: false,
      },
      validator: (value) => {
        return value.myProperty;
      },
    };
    const arrayField: FormField<number[], false> = {
      category: "custom category",
      value: [3, 5, 13],
      validator: (value) => {
        return value[0] + value[1] + value[2] === 1;
      },
    };

    expect(fieldValidator(objectField)).toBe(false);
    expect(fieldValidator(arrayField)).toBe(false);
  });

  test("it should handle edge cases correctly", () => {
    const zeroNumberField: FormField<number, false> = {
      category: "custom category",
      value: 0,
    };

    const emptyHtmlField: FormField<string, false> = {
      category: "custom category",
      value: "<p> </p>",
    };

    const validHtmlField: FormField<string, false> = {
      category: "custom category",
      value: "<p>This is valid html!</p>",
    };

    const emptyString: FormField<string, false> = {
      category: "custom category",
      value: " ",
    };

    expect(fieldValidator(zeroNumberField)).toBe(true);
    expect(fieldValidator(emptyHtmlField)).toBe(false);
    expect(fieldValidator(validHtmlField)).toBe(true);
    expect(fieldValidator(emptyString)).toBe(false);
  });
});

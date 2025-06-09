import { describe, expect, test } from "vitest";
import { GenericDocument } from "@/types/Form";
import { checkFormValidity, getRequiredFields } from "@/utils/form-validator";

describe("FormValidator", () => {
  const validForm: GenericDocument["fields"] = {
    name: {
      category: "my category",
      value: "John Doe",
    },
    email: {
      category: "my category",
      value: "john@doe.it",
      required: true,
    },
    password: {
      category: "my category",
      value: "hunter2",
      required: true,
    },
  };

  const invalidForm: GenericDocument["fields"] = {
    name: {
      category: "my category",
      value: 12515,
    },
    email: {
      category: "my category",
      value: undefined,
      required: true,
    },
    password: {
      category: "my category",
      value: ["hunter2"],
      required: true,
    },
  };

  test("it should get all the required fields", () => {
    const result = getRequiredFields(validForm);
    expect(Object.keys(result).length).toBe(2);
  });

  test("it should validate a valid form", () => {
    expect(checkFormValidity(validForm)).toBe(true);
  });

  test("it should not validate an invalid form", () => {
    expect(checkFormValidity(invalidForm)).toBe(false);
  });
});

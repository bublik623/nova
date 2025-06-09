import { describe, test, expect } from "vitest";
import { string, z } from "zod";
import { useFormValidation } from "../useFormValidation";

const initialValues = {
  title: "My title",
  description: "My description",
};

const schema = z.object({
  title: string(),
  description: string(),
});

describe("useFormValidation", () => {
  test("it does not run the validation on first run", () => {
    const formValues = ref({ ...initialValues });

    const validation = useFormValidation(formValues, schema);

    /// the validation should not run on first invocation...
    expect(validation.formValidationState.value).toBe("INDETERMINATE");
    expect(validation.fieldValidationState.value("title")).toBe("INDETERMINATE");

    // but should be run manually
    validation.runValidation();
    expect(validation.formValidationState.value).toBe("VALID");
    expect(validation.fieldValidationState.value("title")).toBe("VALID");
  });

  test("it runs the validation on first run, if it's passed immediate", () => {
    const formValues = ref({ ...initialValues });

    const validation = useFormValidation(formValues, schema, {
      immediate: true,
    });

    expect(validation.formValidationState.value).toBe("VALID");
  });

  test("it validates a valid form", () => {
    const formValues = ref({ ...initialValues });

    const validation = useFormValidation(formValues, schema, {
      immediate: true,
    });

    expect(validation.fieldValidationState.value("title")).toBe("VALID");
    expect(validation.fieldValidationState.value("description")).toBe("VALID");
  });

  test("it does not validate an invalid form", () => {
    const formValues = ref({ ...initialValues, description: null });

    const validation = useFormValidation(formValues, schema, {
      immediate: true,
    });

    expect(validation.fieldValidationState.value("title")).toBe("VALID");
    expect(validation.fieldValidationState.value("description")).toBe("INVALID");

    expect(validation.getFieldErrors.value("title")).toBeFalsy();
    expect(validation.getFieldErrors.value("description")).toBe("Expected string, received null");
  });
});

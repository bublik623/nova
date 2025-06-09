import { describe, expect, test } from "vitest";
import { useOptionValidation } from "../useOptionValidation";
import { Option } from "@/types/generated/OfferServiceApiOld";

describe("useOptionValidation", () => {
  test("It starts in a indeterminate state", () => {
    const doc = ref<Option>();
    const { validationRanOnce, fieldIsValid, formIsValid, formValidationState, fieldValidationState } =
      useOptionValidation(doc);

    expect(validationRanOnce.value).toBe(false);
    expect(fieldIsValid.value("name")).toBe(false);
    expect(formIsValid.value).toBe(false);
    expect(formValidationState.value).toBe("INDETERMINATE");
    expect(fieldValidationState.value("name")).toBe("INDETERMINATE");
  });

  test("It runs when immediate is set to true", () => {
    const doc = ref<Option>();
    const { validationRanOnce, formValidationState, fieldValidationState } = useOptionValidation(doc, {
      immediate: true,
    });

    expect(validationRanOnce.value).toBe(true);
    expect(formValidationState.value).toBe("INVALID");
    expect(fieldValidationState.value("name")).toBe("INVALID");
  });

  test("It validates a document correctly after it's edited", async () => {
    const doc = ref<Option>({
      name: "My option",
      capacity_type: "capacity",
      experience: "exp-id",
      id: "id",
      multilanguage: false,
    });

    const { validationRanOnce, formIsValid, fieldIsValid } = useOptionValidation(doc, {
      debounce: 0,
    });

    expect(validationRanOnce.value).toBe(false);

    doc.value.name = "!";

    // wait for a tick...
    await Promise.resolve();

    expect(validationRanOnce.value).toBe(true);
    expect(formIsValid.value).toBe(false);
    expect(fieldIsValid.value("name")).toBe(false);
    expect(fieldIsValid.value("duration")).toBe(false);
  });
});

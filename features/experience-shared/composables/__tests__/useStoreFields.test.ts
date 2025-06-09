import { describe, test, expect, beforeEach } from "vitest";
import { ref } from "vue";
import { z } from "zod";
import { useStoreFields, StoreField } from "../useStoreFields";

describe("useStoreFields", () => {
  const initialValues = ref({ name: "John", age: 30 });

  beforeEach(() => {
    initialValues.value = { name: "John", age: 30 };
  });

  const getFields = (): StoreField[] => [
    {
      key: "name",
      isRequired: true,
      schema: z.string().min(1, "Name is required"),
    },
    {
      key: "age",
      isRequired: false,
      schema: z.number().gt(0, "Age must be greater than 0"),
    },
  ];

  test("it should update values when initialValues change", async () => {
    const { values } = useStoreFields(getFields, { initialValues });
    initialValues.value = { name: "Doe", age: 25 };
    await nextTick();
    expect(values.name).toBe("Doe");
    expect(values.age).toBe(25);
  });

  test("it should validate fields correctly", async () => {
    const { isFieldValid, values } = useStoreFields(getFields, { initialValues });

    expect(isFieldValid("name")).toBe(true);
    expect(isFieldValid("age")).toBe(true);

    values.name = "";
    values.age = -1;

    await nextTick();

    expect(isFieldValid("name")).toBe(false);
    expect(isFieldValid("age")).toBe(false);
  });

  test("it should return the correct status of a given field", () => {
    const { getFieldStatus } = useStoreFields(getFields, { initialValues });
    const nameStatus = getFieldStatus("name");

    expect(nameStatus.key).toBe("name");
    expect(nameStatus.isRequired).toBe(true);

    const ageStatus = getFieldStatus("age");
    expect(ageStatus.key).toBe("age");
    expect(ageStatus.isRequired).toBe(false);
  });

  test("it should return the correct errors for the form", () => {
    const { formErrors, values } = useStoreFields(getFields, { initialValues });
    values.name = "";
    expect(formErrors.value).toEqual({ name: ["Name is required"] });
    values.name = "John";
    expect(formErrors.value).toBeUndefined();
  });

  test("it should update values correctly", () => {
    const { values, updateValues } = useStoreFields(getFields, { initialValues });
    updateValues({ name: "Doe", age: 25 });
    expect(values.name).toBe("Doe");
    expect(values.age).toBe(25);
  });

  test("it should detect changes correctly", () => {
    const { hasChanges, updatedValues, updateValues } = useStoreFields(getFields, {
      initialValues,
    });
    expect(hasChanges.value).toBe(false);
    expect(updatedValues.value).toEqual({});

    updateValues({ name: "Doe", age: 25 });

    expect(hasChanges.value).toBe(true);
    expect(updatedValues.value).toEqual({ name: "Doe", age: 25 });
  });

  test('it should detect changes correctly when "initialValues" changes after setup', async () => {
    const localInitialValues = ref({ name: "John", age: 30 });

    const { hasChanges, updatedValues, updateValues } = useStoreFields(getFields, {
      initialValues: localInitialValues,
    });
    expect(hasChanges.value).toBe(false);
    expect(updatedValues.value).toEqual({});

    updateValues({ name: "Doe", age: 25 });

    expect(hasChanges.value).toBe(true);
    expect(updatedValues.value).toEqual({ name: "Doe", age: 25 });

    localInitialValues.value = { name: "Tom", age: 31 };

    expect(hasChanges.value).toBe(true);
    expect(updatedValues.value).toEqual({ name: "Doe", age: 25 });

    updateValues({ name: "Tom", age: 31 });

    expect(hasChanges.value).toBe(false);
    expect(updatedValues.value).toEqual({});
  });

  test("it should detect changes with complex and nested arrays", async () => {
    const getLocalFields = () => [
      {
        key: "items",
        isRequired: true,
        schema: z.array(z.string().min(1, "Item is required")),
      },
    ];

    const localInitialValues = ref({
      items: ["Apple", "Banana"],
    });

    const { hasChanges, updatedValues, updateValues } = useStoreFields(getLocalFields, {
      initialValues: localInitialValues,
    });

    expect(hasChanges.value).toBe(false);
    expect(updatedValues.value).toEqual({});

    updateValues({
      items: ["Apple", "Orange"],
    });

    await nextTick();

    expect(hasChanges.value).toBe(true);
    expect(updatedValues.value).toEqual({
      items: ["Apple", "Orange"],
    });

    localInitialValues.value = {
      items: ["Apple", "Banana", "Orange"],
    };

    expect(hasChanges.value).toBe(true);
    expect(updatedValues.value).toEqual({
      items: ["Apple", "Orange"],
    });

    updateValues({
      items: ["Apple", "Banana", "Orange"],
    });

    expect(hasChanges.value).toBe(false);
    expect(updatedValues.value).toEqual({});
  });

  test("it should detect changes with complex and nested objects", async () => {
    const getLocalFields = () => [
      {
        key: "address",
        isRequired: true,
        schema: z.object({
          street: z.string().min(1, "Street is required"),
          city: z.string().min(1, "City is required"),
        }),
      },
    ];

    const localInitialValues = ref({
      address: {
        street: "Main St",
        city: "New York",
      },
    });

    const { hasChanges, updatedValues, updateValues } = useStoreFields(getLocalFields, {
      initialValues: localInitialValues,
    });

    expect(hasChanges.value).toBe(false);
    expect(updatedValues.value).toEqual({});

    updateValues({
      address: {
        street: "Elm St",
        city: "Los Angeles",
      },
    });

    await nextTick();

    expect(hasChanges.value).toBe(true);
    expect(updatedValues.value).toEqual({
      address: {
        street: "Elm St",
        city: "Los Angeles",
      },
    });

    localInitialValues.value = {
      address: {
        street: "Pine St",
        city: "San Francisco",
      },
    };

    expect(hasChanges.value).toBe(true);
    expect(updatedValues.value).toEqual({
      address: {
        street: "Elm St",
        city: "Los Angeles",
      },
    });

    updateValues({
      address: {
        street: "Pine St",
        city: "San Francisco",
      },
    });

    expect(hasChanges.value).toBe(false);
    expect(updatedValues.value).toEqual({});
  });

  test("it should return the correct required fields", () => {
    const { requiredFields } = useStoreFields(getFields, { initialValues });
    expect(requiredFields.value).toEqual(["name"]);
  });

  test("it should validate the fields correctly", () => {
    const { isValid, values } = useStoreFields(getFields, { initialValues });
    expect(isValid.value).toBe(true);
    values.name = "";
    expect(isValid.value).toBe(false);
  });

  // BUGFIX: When changing the initial values ref, if the new initial values had more properties than the previous ones,
  // the values object would not be updated correctly as it would retain the old properties.
  // We now delete all properties from the values object before assigning the new initial values.
  test("it should update values correctly when new initial values have more properties", async () => {
    const localInitialValues = ref({ name: "Doe", age: 25, email: "x@y.z" });
    const localGetFields = () => [
      ...getFields(),
      {
        key: "email",
        isRequired: false,
        schema: z.string().email("Invalid email"),
      },
    ];

    const { values, hasChanges, updatedValues } = useStoreFields(localGetFields, { initialValues: localInitialValues });
    await nextTick();

    expect(values.name).toBe("Doe");
    expect(values.age).toBe(25);
    expect(values.email).toBe("x@y.z");

    initialValues.value = { name: "Tom", age: 31 };

    expect(hasChanges.value).toBe(false);
    expect(updatedValues.value).toEqual({});

    // The email property should have been deleted
    expect(updatedValues.value.email).toBeUndefined();
    expect(Object.keys(initialValues.value)).not.toContain("email");
  });

  // BUGFIX: We want to ignore fields not declared in the 'getFields' function.
  test("it should ignore fields that are not present into the getFields function", () => {
    const moreInitialValues = ref({
      ...initialValues.value,
    });

    // @ts-expect-error TS complains here, but there are cases where it doesn't
    moreInitialValues.value.mistakenlyAddedField = "This should not be here";

    const fields = useStoreFields(getFields, { initialValues: moreInitialValues });

    // @ts-expect-error We don't care if the field is in the initial values
    expect(fields.initialValues.value.mistakenlyAddedField).toBe("This should not be here");

    // @ts-expect-error Or in the values
    expect(fields.values.mistakenlyAddedField).toBe("This should not be here");

    // @ts-expect-error But we don't want it in the updated values
    expect(fields.updatedValues.value.mistakenlyAddedField).toBeUndefined();

    // Because otherwise it will trip up the change detection
    expect(fields.hasChanges.value).toBe(false);
  });
});

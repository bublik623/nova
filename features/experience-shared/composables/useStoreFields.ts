import { z } from "zod";
import { getChangedValues } from "../utils/get-changed-values";
import { cloneDeep } from "lodash";

type InitialValues = Record<string, any>;

export type StoreError =
  | {
      [x: string]: string[] | undefined;
    }
  | undefined;

export type StoreField = {
  key: string;
  // We manually defined this as a boolean, because there might be cases where we
  // want to make a field optional but still have a schema for it, or have a field required but without a schema
  isRequired: boolean;
  schema: z.ZodType<any, any, any>;
};

export interface FieldStatus {
  key: string;
  isValid: boolean;
  isRequired: boolean;
}

export function useStoreFields<T extends InitialValues>(
  getFields: (values: T) => StoreField[],
  options: {
    initialValues: Ref<T | undefined>;
  }
) {
  type ValueType = typeof values;

  const { initialValues } = options;

  // The shape of the object is determined by the shape of the initial values, not the fields.
  const fields = computed(() => getFields(values as T));

  const values = reactive<T>({} as T);

  const fieldStatus = computed<FieldStatus[]>(() =>
    fields.value.map((field) => ({
      key: field.key,
      isValid: isFieldValid(field.key),
      isRequired: getFieldConfig(field.key).isRequired,
    }))
  );

  const requiredFields = computed<string[]>(() =>
    fields.value.flatMap((field) => {
      if (getFieldConfig(field.key).isRequired) {
        return field.key;
      } else {
        return [];
      }
    })
  );

  const formErrors = computed<StoreError>(() => {
    const schemaObject = fields.value.reduce((acc, field) => {
      acc[field.key] = field.schema;
      return acc;
    }, {} as Record<string, z.ZodType<any, any, any>>);

    const result = z.object(schemaObject).safeParse(values);

    if (result.success) {
      return;
    }

    return result.error.formErrors.fieldErrors;
  });

  const isValid = computed(() => Object.keys(formErrors.value || {}).length === 0);

  const updatedValues = computed(() => {
    const cleanedInitialValues = filterOutUnexpectedProperties(initialValues.value || {});
    const cleanedValues = filterOutUnexpectedProperties(values);

    const changedValues = getChangedValues(cleanedInitialValues, cleanedValues);

    return changedValues;
  });

  const hasChanges = computed<boolean>(() => {
    return Object.keys(updatedValues?.value || {}).length > 0;
  });

  watch(
    () => initialValues.value,
    (newInitialValues) => {
      // Delete all properties from the values object first
      Object.keys(values).forEach((key) => {
        delete values[key];
      });

      Object.assign(values, cloneDeep(newInitialValues || {}));
    },
    {
      deep: true,
      immediate: true,
    }
  );

  return {
    requiredFields,
    fieldStatus,
    getFieldStatus,
    isFieldValid,
    isValid,
    values,
    updateValues,
    updatedValues,
    hasChanges,
    formErrors,
    initialValues,
  };

  function updateValues(newValues: T) {
    Object.assign(values, cloneDeep(filterOutUnexpectedProperties(newValues)));
  }

  function getFieldConfig(fieldKey: string) {
    const config = fields.value.find((f) => f.key === fieldKey);

    if (!config) {
      throw new Error(`Field ${fieldKey} not found in fields`);
    }

    return config;
  }

  function isFieldValid(fieldKey: string): boolean {
    const fieldConfig = getFieldConfig(fieldKey);

    return fieldConfig.schema.safeParse(values[fieldKey]).success;
  }

  function getFieldStatus(fieldKey: keyof T): FieldStatus {
    const field = fieldStatus.value.find((f) => f.key === fieldKey);

    if (!field) {
      throw new Error(`Field ${String(fieldKey)} not found in fieldStatus`);
    }

    return field;
  }

  // This function filters out all unexpected properties from the object, which are not declared in the fields setup.
  // It will remove them from the values and updatedValues object, but not from the initialValues object.
  // If we don't filter them out, the change detection will fail.
  function filterOutUnexpectedProperties<O extends Record<string, unknown>>(obj: O) {
    const keys = fields.value.map((f) => f.key);
    return Object.keys(obj).reduce((acc, key) => {
      if (keys.includes(key)) {
        acc[key] = obj[key];
      }
      return acc;
    }, {} as ValueType);
  }
}

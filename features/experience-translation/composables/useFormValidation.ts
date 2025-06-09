import { ZodError, ZodSchema } from "zod";

enum ValidationStates {
  VALID = "VALID",
  INVALID = "INVALID",
  INDETERMINATE = "INDETERMINATE",
}

export function useFormValidation<
  FormValues extends Record<string, any> | Record<string, any>[],
  Schema extends ZodSchema
>(
  formRef: Ref<FormValues | undefined> | ComputedRef<FormValues | undefined>,
  schema: Schema,
  options?: {
    immediate?: boolean;
    debounce?: number;
  }
) {
  const validationRanOnce = ref(false);

  const validationErrors = ref<ZodError<Schema>>();

  const formIsValid = computed(() => formValidationState.value === ValidationStates.VALID);
  const fieldIsValid = computed(
    () => (key: keyof FormValues) => fieldValidationState.value(key) === ValidationStates.VALID
  );

  const formValidationState = computed<ValidationStates>(() =>
    getFormValidationState(validationRanOnce.value, validationErrors.value)
  );
  const fieldValidationState = computed(
    () => (key: keyof FormValues) =>
      _getFieldValidationState(validationRanOnce.value, validationErrors.value, key as string)
  );

  const getFieldErrors = computed(() => (key: keyof FormValues) => {
    return _getFieldErrors(validationErrors.value, key);
  });

  // we use this instead of the watchDebounced option, because watchDebounced
  // runs with the debounce delay even when immediate is true.
  if (options?.immediate) {
    runValidation();
  }

  function runValidation() {
    const val = schema.safeParse(formRef.value);

    if (val.success) {
      validationErrors.value = undefined;
    } else {
      validationErrors.value = val.error;
    }

    validationRanOnce.value = true;

    return val;
  }

  return {
    validationRanOnce,
    validationErrors,
    formIsValid,
    fieldIsValid,
    runValidation,
    formValidationState,
    fieldValidationState,
    getFieldErrors,
  };
}

function getFormValidationState<Schema extends ZodSchema>(
  validationRanOnce: boolean,
  validationErrors: ZodError<Schema> | undefined
) {
  if (!validationRanOnce) {
    return ValidationStates.INDETERMINATE;
  } else {
    return validationErrors ? ValidationStates.INVALID : ValidationStates.VALID;
  }
}

function _getFieldValidationState<Schema extends ZodSchema>(
  validationRanOnce: boolean,
  validationErrors: ZodError<Schema> | undefined,
  key: string
) {
  if (!validationRanOnce) {
    return ValidationStates.INDETERMINATE;
  } else {
    return _getFieldErrors(validationErrors, key) ? ValidationStates.INVALID : ValidationStates.VALID;
  }
}

function _getFieldErrors<FormValues, Schema extends ZodSchema>(
  validationErrors: ZodError<Schema> | undefined,
  key: keyof FormValues
) {
  return validationErrors?.issues
    .flatMap((issue) => {
      if (issue.path.join(".") === key) {
        return issue.message;
      }

      return [];
    })
    .join(", ");
}

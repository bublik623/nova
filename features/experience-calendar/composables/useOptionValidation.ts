import { watchDebounced } from "@vueuse/shared";
import { ZodError } from "zod";
import { Option } from "@/types/generated/OfferServiceApi";
import {
  OptionsSettingSchema,
  optionsSettingSchema,
} from "@/features/experience-calendar/schemas/option-settings.schema";

enum ValidationStates {
  VALID = "VALID",
  INVALID = "INVALID",
  INDETERMINATE = "INDETERMINATE",
}

export function useOptionValidation(
  document: Ref<Option | undefined | null> | ComputedRef<Option | undefined | null>,
  options?: {
    immediate?: boolean;
    debounce?: number;
  }
) {
  const validationRanOnce = ref(false);

  const validationErrors = ref<ZodError<OptionsSettingSchema>>();

  const formIsValid = computed(() => formValidationState.value === ValidationStates.VALID);

  const fieldIsValid = computed(
    () => (key: keyof OptionsSettingSchema) => fieldValidationState.value(key) === ValidationStates.VALID
  );

  const formValidationState = computed<ValidationStates>(() =>
    getFormValidationState(validationRanOnce.value, validationErrors.value)
  );

  const fieldValidationState = computed(
    () => (key: keyof OptionsSettingSchema) =>
      getFieldValidationState(validationRanOnce.value, validationErrors.value, key)
  );

  // we use this instead of the watchDebounced option, because watchDebounced
  // runs with the debounce delay even when immediate is true.
  if (options?.immediate) {
    runValidation();
  }

  watchDebounced(() => document.value, runValidation, {
    debounce: options?.debounce ?? 500,
    maxWait: 2000,
    deep: true,
  });

  return {
    validationRanOnce,
    getFieldErrors,
    validationErrors,
    formIsValid,
    fieldIsValid,
    runValidation,
    formValidationState,
    fieldValidationState,
  };

  function getFieldErrors(key: keyof OptionsSettingSchema) {
    return _getFieldErrors(validationErrors.value, key);
  }

  function runValidation() {
    // Remove null properties, if they are required in the schema it will error anyway.
    const removeNullKeys = Object.entries(document.value || {}).reduce(
      (a, [k, v]) => (v === null ? a : ((a[k] = v), a)),
      {} as Record<string, unknown>
    );
    const val = optionsSettingSchema.safeParse(removeNullKeys);

    if (val.success) {
      validationErrors.value = undefined;
    } else {
      validationErrors.value = val.error;
    }

    validationRanOnce.value = true;

    return val;
  }
}

function getFormValidationState(
  validationRanOnce: boolean,
  validationErrors: ZodError<OptionsSettingSchema> | undefined
) {
  if (!validationRanOnce) {
    return ValidationStates.INDETERMINATE;
  } else {
    return validationErrors ? ValidationStates.INVALID : ValidationStates.VALID;
  }
}

function getFieldValidationState(
  validationRanOnce: boolean,
  validationErrors: ZodError<OptionsSettingSchema> | undefined,
  key: keyof OptionsSettingSchema
) {
  if (!validationRanOnce) {
    return ValidationStates.INDETERMINATE;
  } else {
    return _getFieldErrors(validationErrors, key) ? ValidationStates.INVALID : ValidationStates.VALID;
  }
}
function _getFieldErrors(
  validationErrors: ZodError<OptionsSettingSchema> | undefined,
  key: keyof OptionsSettingSchema
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

function _getKeyedErrors(validationErrors: ZodError<OptionsSettingSchema> | undefined) {
  return validationErrors?.issues.reduce((acc, issue) => {
    const key = issue.path.join(".");

    return {
      [key]: [...(acc[key] || []), issue.message],
    };
  }, {} as Record<string, string[]>);
}

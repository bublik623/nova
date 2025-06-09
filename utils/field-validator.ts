import { FormField } from "@/types/Form";

/**
 *
 * @param field a generic Form Field
 * @description this function validates a form field, either with it's own custom validator,
 * or with a generic mon-nullish validator for strings and arrays
 */
export function fieldValidator<T>(field: FormField<T> | undefined): boolean {
  if (field == null) {
    return false;
  }

  if (field.validator) {
    return field.validator(field.value);
  }

  if (Array.isArray(field.value)) {
    return field.value.length > 0;
  }

  if (field.value == null) {
    return false;
  }

  if (typeof field.value === "string") {
    const stripHtml = field.value.replace(/<[^>]+>/g, "");

    return stripHtml.trim().length > 0;
  }

  return true;
}

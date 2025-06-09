import { fieldValidator } from "./field-validator";
import { FormField, GenericDocument } from "@/types/Form";

/**
 *
 * @param form A generic store form
 * @description returns an object with all the required fields.
 */
export function getRequiredFields<T extends GenericDocument["fields"]>(form: T) {
  return Object.entries(form).reduce((output, input) => {
    const [fieldName, value] = input;
    if (value.required) {
      output[fieldName as keyof T] = value;
    }
    return output;
  }, {} as Partial<T>);
}

/**
 *
 * @param form A generic store form
 * @description checks if all the required fields are valid.
 */
export function checkFormValidity<T extends GenericDocument["fields"]>(form: T): boolean {
  const requiredFields = getRequiredFields(form);

  return Object.entries(requiredFields)
    .map(([, field]) => fieldValidator(field as FormField))
    .every((v) => v);
}

// here we could also have
// export function checkFormIsModified(form: GenericDocument): boolean {
//   const requiredFields = getRequiredFields(form);
//   return Object.entries(form.fields)
//     .map(([, field]) => field.isModified)
//     .every((v) => v);
// }

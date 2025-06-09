/**
 * This type will provide the paths for the leaves attributes of the given type argument.
 * @example
 * ```
 * const paths: PathToLeafOf<{ a?: string; b: { c: { d: number; e: { f: string } } }[], g: string[] }>[] = [
 *   "a",
 *   "b.c.d",
 *   "b.c.e.f",
 *   "g",
 * ];
 * ```
 * @example
 * ```
 * const pathsOfDistributionContent: PathToLeafOf<DistributionContent>[] = {
 *   "id",
 *   "short_reference_code",
 *   ...
 *   "experience_content.experience_id",
 *   ...
 *   "experience_content.experience_translation.creation_date",
 *   "experience_content.experience_translation.updated_date",
 *   ...
 *   "experience_content.custom_highlights.code",
 *   ...
 *   "experience_content.custom_included.name",
 *   ...
 *   "experience_content.custom_important_information.name",
 *   ...
 *   "functional_content.markets",
 * };
 * ```
 */
export type PathToLeafOf<T extends object> = {
  [key in keyof T & (string | number)]: T[key] extends Array<string> | undefined
    ? `${key}`
    : T[key] extends Array<object> | undefined
    ? `${key}.${PathToLeafOf<NonNullable<T[key]>[number]>}`
    : T[key] extends object | undefined
    ? `${key}.${PathToLeafOf<NonNullable<T[key]>>}`
    : `${key}`;
}[keyof T & (string | number)];

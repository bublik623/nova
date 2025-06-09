import { isEqual } from "lodash";
/**
 * Compares two objects and returns the keys that have different values.
 * @param oldObj The first object to compare.
 * @param newObj The second object to compare.
 * @returns An array of keys that have different values in the two objects.
 */

export function getChangedKeys<T extends Record<string, any>>(oldObj: T, newObj: T): (keyof T)[] {
  return (Object.keys(oldObj) as (keyof T)[]).filter((key) => !isEqual(oldObj[key], newObj[key]));
}

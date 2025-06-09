import { detailedDiff } from "deep-object-diff";
import { merge } from "lodash";

interface KeyValue {
  [s: string]: any;
}

/**
 * This function compares the original and updated objects and returns the changed values.
 */
export function getChangedValues<T>(original: KeyValue, updated: T): Partial<T> {
  const result = getChangedProperties(original, updated as KeyValue);
  return result as T;
}

// refactor idea: we could also deep walk each props
function getChangedProperties(original: KeyValue, updated: KeyValue): KeyValue {
  const diff: KeyValue = detailedDiff(original, updated);

  // Remove any props that are in the deleted.difference but not in the passed options
  function cleanupDeletedProps(updatedProperties: KeyValue, deletedProperties: KeyValue): void {
    for (const key of Object.keys(deletedProperties)) {
      if (!(key in updatedProperties)) {
        delete deletedProperties[key];
      } else if (typeof updatedProperties[key] === "object" && !Array.isArray(updatedProperties[key])) {
        cleanupDeletedProps(updatedProperties[key], deletedProperties[key]);
        // Delete the property if it became empty after cleanup
        if (Object.keys(deletedProperties[key]).length === 0) {
          delete deletedProperties[key];
        }
      }
    }
  }
  cleanupDeletedProps(updated, diff.deleted);

  const newProps = merge({}, diff.added, diff.updated, diff.deleted);
  // deep-object-diff converts arrays to objects, set original array back here
  const restoreOriginalArray = (originalArray: KeyValue, updatedArray: KeyValue): void => {
    for (const [key, updatedValue] of Object.entries(updatedArray)) {
      const originalValue = originalArray[key];
      if (Array.isArray(originalValue)) {
        updatedArray[key] = originalValue;
      } else if (updatedValue && typeof originalValue === "object") {
        restoreOriginalArray(originalValue, updatedValue);
      }
    }
  };
  restoreOriginalArray(updated, newProps);

  return newProps;
}

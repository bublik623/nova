import { GenericHighlight } from "@/types/Highlights";

export function getAddedItems(
  oldArray: GenericHighlight[] | undefined,
  newArray: GenericHighlight[] | undefined,
  key: keyof GenericHighlight
) {
  if (!newArray) {
    return [];
  }
  return newArray.filter((newItem) => !oldArray?.some((oldItem) => oldItem[key] === newItem[key]));
}

export function getRemovedItems(
  oldArray: GenericHighlight[] | undefined,
  newArray: GenericHighlight[] | undefined,
  key: keyof GenericHighlight
) {
  if (!newArray) {
    return [];
  }
  return oldArray?.filter((oldItem) => !newArray?.some((newItem) => newItem[key] === oldItem[key])) || [];
}

/**
 * Merge two arrays and remove duplicates
 *
 * @param oldArray - The old array
 * @param newArray - The new array
 * @param key - The key to use to compare the items
 */
export function mergeUnique(
  oldArray: GenericHighlight[] | undefined,
  newArray: GenericHighlight[] | undefined,
  key: keyof GenericHighlight
) {
  const mergedArray = (oldArray || []).concat(newArray || []);
  // Remove duplicates
  return mergedArray.filter((item, index, self) => self.findIndex((v) => v[key] === item[key]) === index);
}

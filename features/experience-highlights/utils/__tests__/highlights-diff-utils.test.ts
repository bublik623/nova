import { GenericHighlight } from "@/types/Highlights";
import { getAddedItems, getRemovedItems, mergeUnique } from "../highlights-diff-utils";
import { describe, test, expect } from "vitest";

describe("diff-utils", () => {
  const oldArray: GenericHighlight[] = [
    { code: "1", name: "Item 1", id: "1", visualization_order: 1 },
    { code: "2", name: "Item 2", id: "2", visualization_order: 2 },
  ];
  const newArray: GenericHighlight[] = [
    { code: "2", name: "Item 2", id: "2", visualization_order: 2 },
    { code: "3", name: "Item 3", id: "3", visualization_order: 3 },
  ];

  describe("getAddedItems", () => {
    test("should return an empty array if the new array is undefined", () => {
      const result = getAddedItems(oldArray, undefined, "code");

      expect(result).toEqual([]);
    });

    test("should return an empty array if the old array is undefined", () => {
      const result = getAddedItems(undefined, newArray, "code");

      expect(result).toEqual(newArray);
    });

    test("should return items that are in the new array but not in the old array", () => {
      const result = getAddedItems(oldArray, newArray, "code");

      expect(result).toEqual([{ code: "3", name: "Item 3", id: "3", visualization_order: 3 }]);
    });
  });

  describe("getRemovedItems", () => {
    test("should return an empty array if the new array is undefined", () => {
      const result = getRemovedItems(oldArray, undefined, "code");

      expect(result).toEqual([]);
    });

    test("should return an empty array if the old array is undefined", () => {
      const result = getRemovedItems(undefined, newArray, "code");

      expect(result).toEqual([]);
    });

    test("should return items that are in the old array but not in the new array", () => {
      const result = getRemovedItems(oldArray, newArray, "code");

      expect(result).toEqual([{ code: "1", name: "Item 1", id: "1", visualization_order: 1 }]);
    });
  });

  describe("mergeUnique", () => {
    test("should return a merged array without duplicates", () => {
      const result = mergeUnique(oldArray, newArray, "code");

      expect(result).toEqual([
        { code: "1", name: "Item 1", id: "1", visualization_order: 1 },
        { code: "2", name: "Item 2", id: "2", visualization_order: 2 },
        { code: "3", name: "Item 3", id: "3", visualization_order: 3 },
      ]);
    });

    test("should return an empty array if both arrays are undefined", () => {
      const result = mergeUnique(undefined, undefined, "code");

      expect(result).toEqual([]);
    });
  });
});

import { describe, it, expect } from "vitest";
import { getChangedKeys } from "./getChangedKeys";

describe("getChangedKeys", () => {
  it("should return an empty array when both objects are identical", () => {
    const obj = { a: 1, b: "test", c: [1, 2, 3], d: { nested: true } };
    expect(getChangedKeys(obj, { ...obj })).toEqual([]);
  });

  it("should return keys with different primitive values", () => {
    const oldObj = { a: 1, b: 2 };
    const newObj = { a: 1, b: 3 };
    expect(getChangedKeys(oldObj, newObj)).toEqual(["b"]);
  });

  it("should detect changes in nested objects and arrays", () => {
    const oldObj = { arr: [1, 2], nested: { a: "x" } };
    const newObj = { arr: [1, 2, 3], nested: { a: "x", b: "y" } };
    // The order follows the keys of oldObj
    expect(getChangedKeys(oldObj, newObj)).toEqual(["arr", "nested"]);
  });

  it("should detect boolean value changes", () => {
    const oldObj = { flag: true };
    const newObj = { flag: false };
    expect(getChangedKeys(oldObj, newObj)).toEqual(["flag"]);
  });

  it("should ignore keys not present in the old object", () => {
    const oldObj = { a: 1 };
    const newObj = { a: 2, b: 3 };
    expect(getChangedKeys(oldObj, newObj)).toEqual(["a"]);
  });

  it("should handle empty objects", () => {
    expect(getChangedKeys({}, {})).toEqual([]);
  });
});

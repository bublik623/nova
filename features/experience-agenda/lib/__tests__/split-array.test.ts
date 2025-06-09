import { describe, expect, test } from "vitest";
import { splitArray } from "../split-array";

describe("splitArray", () => {
  test("split an array in multiple subarrays with a max length", () => {
    const array = ["1", "2", "3", "4", "5", "6"];

    const expectedOneElement = [["1"], ["2"], ["3"], ["4"], ["5"], ["6"]];
    const expectedTwoElements = [
      ["1", "2"],
      ["3", "4"],
      ["5", "6"],
    ];

    expect(splitArray(array as string[], 1)).toEqual(expectedOneElement);
    expect(splitArray(array as string[], 2)).toEqual(expectedTwoElements);
  });
});

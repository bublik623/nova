import { describe, test, expect } from "vitest";
import { findDayOfTheWeek } from "../find-day-of-the-week";

describe("findDayOfTheWeek", () => {
  describe("if you pass as parameter a number from 1 to 7", () => {
    test("it returns the correct day", () => {
      const cases = [1, 2, 3, 4, 5, 6, 7];
      const expected = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

      cases.map((s, id) => expect(findDayOfTheWeek(s)).toBe(expected[id]));
    });
  });

  describe("if you pass as parameter a different number", () => {
    test("it should throw an error", () => {
      expect(() => findDayOfTheWeek(8)).toThrow("The number is not related to any day of the week");

      expect(() => findDayOfTheWeek(0)).toThrow("The number is not related to any day of the week");
    });
  });
});

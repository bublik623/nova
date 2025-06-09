import { formatDay } from "../slot-helpers";
import { describe, it, expect } from "vitest";

describe("formatDay", () => {
  it('formats a date string to "EEE, d" format', () => {
    const testCases = [
      { input: "2023-04-01", expected: "Sat, 1" },
      { input: "2023-12-25", expected: "Mon, 25" },
      { input: "2024-02-29", expected: "Thu, 29" },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatDay(input)).toBe(expected);
    });
  });

  it("returns 'invalid date' for invalid date strings", () => {
    const invalidDates = "invalid-date";

    expect(formatDay(invalidDates)).toBe("invalid date");
  });
});

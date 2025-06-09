import { describe, test, expect } from "vitest";
import { isDateRange } from "../date-range";

describe("isDateRange", () => {
  test("it should check if a value is a date range object", () => {
    expect(isDateRange({ from: new Date(2050, 1, 1), to: new Date(2050, 1, 1) })).toBe(true);
    expect(isDateRange({ from: new Date(2050, 1, 1) })).toBe(true);
    expect(isDateRange({ to: new Date(2050, 1, 1) })).toBe(true);
    expect(isDateRange({ from: new Date(2050, 1, 1), to: "Invalid" })).toBe(false);
    expect(isDateRange({ to: new Date(2050, 1, 1), from: "Invalid" })).toBe(false);
    expect(isDateRange({ from: new Date(2050, 1, 1), to: {} })).toBe(false);
    expect(isDateRange({ to: new Date(2050, 1, 1), from: {} })).toBe(false);
    expect(isDateRange({})).toBe(false);
    expect(isDateRange([])).toBe(false);
    expect(isDateRange(12)).toBe(false);
    expect(isDateRange("Anything")).toBe(false);
  });
});

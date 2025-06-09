import { describe, test, expect } from "vitest";
import { formatDateRangeLabel, formatDateToString, getDateRange } from "./date-utils";

describe("getDateRange", () => {
  test("should return the date range", () => {
    const dateRange = getDateRange("15-03-2025", "30-03-2025");

    expect(dateRange.from?.getFullYear()).toBe(2025);
    expect(dateRange.from?.getMonth()).toBe(2); // March is 2 (0-indexed)
    expect(dateRange.from?.getDate()).toBe(15);

    expect(dateRange.to?.getFullYear()).toBe(2025);
    expect(dateRange.to?.getMonth()).toBe(2); // March is 2 (0-indexed)
    expect(dateRange.to?.getDate()).toBe(30);
  });

  test("should return undefined if the date from is undefined", () => {
    const dateRange = getDateRange(undefined, "30-03-2025");
    expect(dateRange).toEqual({
      from: undefined,
      to: undefined,
    });
  });

  test("should return undefined if the date to is undefined", () => {
    const dateRange = getDateRange("15-03-2025", undefined);
    expect(dateRange).toEqual({
      from: undefined,
      to: undefined,
    });
  });

  test("should return undefined if both dates are undefined", () => {
    const dateRange = getDateRange(undefined, undefined);
    expect(dateRange).toEqual({
      from: undefined,
      to: undefined,
    });
  });

  test("support different date formats", () => {
    const dateRange = getDateRange("2025-03-15", "2025-03-30", "yyyy-MM-dd");
    expect(dateRange.from?.getFullYear()).toBe(2025);
    expect(dateRange.from?.getMonth()).toBe(2); // March is 2 (0-indexed)
    expect(dateRange.from?.getDate()).toBe(15);

    expect(dateRange.to?.getFullYear()).toBe(2025);
    expect(dateRange.to?.getMonth()).toBe(2); // March is 2 (0-indexed)
    expect(dateRange.to?.getDate()).toBe(30);
  });
});

describe("formatDateToString", () => {
  test("should format the date to the format dd-MM-yyyy", () => {
    const date = new Date(2025, 2, 15);
    const formattedDate = formatDateToString(date);
    expect(formattedDate).toBe("15-03-2025");
  });
});

describe("formatDateRangeLabel", () => {
  test("should format the date range to the format: dd/MM/yyyy - dd/MM/yyyy", () => {
    const dateRange = { from: new Date(2025, 2, 15), to: new Date(2025, 2, 30) };
    const formattedDateRange = formatDateRangeLabel(dateRange.from, dateRange.to);
    expect(formattedDateRange).toBe("15/03/2025 - 30/03/2025");
  });

  test("should return an empty string if the date from is undefined", () => {
    const formattedDateRange = formatDateRangeLabel(undefined, new Date(2025, 2, 30));
    expect(formattedDateRange).toBe("");
  });

  test("should return an empty string if the date to is undefined", () => {
    const formattedDateRange = formatDateRangeLabel(new Date(2025, 2, 15), undefined);
    expect(formattedDateRange).toBe("");
  });

  test("should return an empty string if both dates are undefined", () => {
    const formattedDateRange = formatDateRangeLabel(undefined, undefined);
    expect(formattedDateRange).toBe("");
  });
});

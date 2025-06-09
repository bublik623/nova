import { describe, test, expect, it } from "vitest";
import {
  addDays,
  startOfMonth,
  endOfMonth,
  compareDatesWithoutTime,
  getDaysOfWeek,
  getDates,
  formatDateFromString,
  formatDateTimeAsUTCRegardlessOfTimezone,
} from "../date-utils";
import { ShortDayNames } from "@/types/DateTypes";

describe("startOfMonth", () => {
  test("it should return the first day of a month", () => {
    expect(startOfMonth(new Date(2022, 1, 1))).toEqual(new Date(2022, 1, 1));
    expect(startOfMonth(new Date(2022, 1, 10))).toEqual(new Date(2022, 1, 1));
    expect(startOfMonth(new Date(2022, 12, 31))).toEqual(new Date(2022, 12, 1));
    expect(startOfMonth(new Date(2022, 4, 10))).toEqual(new Date(2022, 4, 1));
  });
});

describe("endOfMonth", () => {
  test("it should return the last day of a month", () => {
    expect(endOfMonth(new Date(2022, 0, 1)).getMonth()).toEqual(0);
    expect(endOfMonth(new Date(2022, 0, 1)).getDate()).toEqual(31);
    expect(endOfMonth(new Date(2022, 1, 10)).getMonth()).toEqual(1);
    expect(endOfMonth(new Date(2022, 1, 10)).getDate()).toEqual(28);
  });
});

describe("compareDatesWithoutTime", () => {
  test("it should return true if two dates are equal, without considering the time", () => {
    expect(compareDatesWithoutTime(new Date(2022, 8, 10, 12), new Date(2022, 8, 10, 15))).toBeTruthy();
    expect(compareDatesWithoutTime(new Date(2022, 8, 10, 12), new Date(2022, 8, 10, 12))).toBeTruthy();
    expect(compareDatesWithoutTime(new Date(2022, 8, 10, 12), new Date(2022, 8, 11, 12))).toBeFalsy();
    expect(compareDatesWithoutTime(new Date(2022, 8, 10, 12), new Date(2021, 8, 10, 12))).toBeFalsy();
    expect(compareDatesWithoutTime(new Date(2022, 8, 10, 12), new Date(2022, 9, 10, 12))).toBeFalsy();
  });
});

describe("addDays", () => {
  test("addDays adds the specified number of days to the given date", () => {
    const date = new Date("2022-01-01");
    const days = 10;
    const result = addDays(date, days);
    expect(result).toEqual(new Date("2022-01-11"));
  });
});

describe("getDaysOfWeek", () => {
  test("it should return the correct days of the week for a single day", () => {
    const dateRange = ["2022-12-12", "2022-12-12"];
    expect(getDaysOfWeek(dateRange[0], dateRange[1])).toEqual({
      Mon: true,
      Tue: false,
      Wed: false,
      Thu: false,
      Fri: false,
      Sat: false,
      Sun: false,
    } as Record<ShortDayNames, boolean>);
  });

  test("it should return the correct days of the week for a full week", () => {
    const dateRange = ["2022-12-12", "2022-12-18"];
    expect(getDaysOfWeek(dateRange[0], dateRange[1])).toEqual({
      Mon: true,
      Tue: true,
      Wed: true,
      Thu: true,
      Fri: true,
      Sat: true,
      Sun: true,
    } as Record<ShortDayNames, boolean>);
  });

  test("it should return the correct days of the week for a partial week", () => {
    const dateRange = ["2022-12-15", "2022-12-17"];
    expect(getDaysOfWeek(dateRange[0], dateRange[1])).toEqual({
      Mon: false,
      Tue: false,
      Wed: false,
      Thu: true,
      Fri: true,
      Sat: true,
      Sun: false,
    });
  });

  test("it should return true for each day if the range is too long", () => {
    const dateRange = ["2022-12-15", "2023-03-31"];
    expect(getDaysOfWeek(dateRange[0], dateRange[1])).toEqual({
      Mon: true,
      Tue: true,
      Wed: true,
      Thu: true,
      Fri: true,
      Sat: true,
      Sun: true,
    } as Record<ShortDayNames, boolean>);
  });
});

describe("getDays", () => {
  test("it should return a list of dates between two dates", () => {
    const result = getDates(new Date(2022, 8, 10, 12), new Date(2022, 8, 15, 10));

    expect(result.length).toBe(6);
    expect(result).toStrictEqual([
      new Date(2022, 8, 10),
      new Date(2022, 8, 11),
      new Date(2022, 8, 12),
      new Date(2022, 8, 13),
      new Date(2022, 8, 14),
      new Date(2022, 8, 15),
    ]);
  });

  test("it should return an empty list if endDate is > than startDate", () => {
    const result = getDates(new Date(2022, 8, 15), new Date(2022, 8, 10));

    expect(result.length).toBe(0);
  });
});

describe("formatDateFromString", () => {
  test("should format a valid date string", () => {
    const date = "2022-01-01T12:34:56.789Z";
    expect(formatDateFromString(date)).toBe("01/01/2022");
  });

  test("should return an empty string for an empty input", () => {
    expect(formatDateFromString()).toBe("");
  });
});

describe("formatDateTimeAsUTCRegardlessOfTimezone", () => {
  it("should return the given date formatted as YYYY-MM-DDThh:mm:ss.sssZ without considering the offset", () => {
    const date = new Date(Date.UTC(2024, 1, 7, 5, 5, 8, 2));
    const expectedResult = "2024-02-07T05:05:08.002Z";

    expect(formatDateTimeAsUTCRegardlessOfTimezone(date)).toBe(expectedResult);
  });

  it("should return undefined when the given date is undefined", () => {
    expect(formatDateTimeAsUTCRegardlessOfTimezone(undefined)).toBeUndefined();
  });
});

import { describe, test, expect } from "vitest";
import { parseStringTime, updateStringTime } from "../parse-string-time";
import { TimeUnit } from "@/types/TimeUnit";

describe("parseStringTime", () => {
  test("it returns an object '{hour: number, minutes: number, seconds: number}'", () => {
    const cases = ["14:12:10", "13:00:09"];
    const expected = [
      { hour: 14, minutes: 12, seconds: 10 },
      { hour: 13, minutes: 0, seconds: 9 },
    ];

    cases.map((s, id) => expect(parseStringTime(s)).toEqual(expected[id]));
  });

  describe("if time is undefined", () => {
    test("it should return an undefined object", () => {
      expect(parseStringTime(undefined)).toStrictEqual({ hour: undefined, minutes: undefined, seconds: undefined });
    });
  });
});

describe("updateStringTime", () => {
  test("it returns the updated string", () => {
    const cases = [
      { time: "12:00:00", unit: TimeUnit.hour, value: 14 },
      { time: "02:01:12", unit: TimeUnit.minutes, value: 4 },
      { time: "22:00:10", unit: TimeUnit.seconds, value: 30 },
    ];
    const expected = ["14:00:00", "02:04:12", "22:00:30"];

    cases.map((s, id) => expect(updateStringTime(s.time, s.unit, s.value)).toEqual(expected[id]));
  });

  describe("if time is undefined", () => {
    test("it should return an undefined", () => {
      expect(updateStringTime(undefined, TimeUnit.hour, 14)).toBe(undefined);
    });
  });
});

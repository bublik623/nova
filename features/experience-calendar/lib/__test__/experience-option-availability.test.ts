/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi } from "vitest";
import * as availabilityLib from "../experience-option-availability";
import { ExperienceType } from "@/types/generated/OfferServiceApiOld";

vi.mock("@/utils/uuid", () => ({
  uuid: () => "test-uuid",
}));

describe("Availability Lib", () => {
  test("validateFields", () => {
    expect(availabilityLib.validateFields({} as any)).toBe(false);
    expect(
      availabilityLib.validateFields({
        name: "Test availability",
        option: "option-id",
        pricings: [],
        expiration_date: null,
        expiration_days: null,
      })
    ).toBe(false);
    expect(
      availabilityLib.validateFields({
        name: "Test availability",
        option: "option-id",
        pricings: [],
        expiration_date: null,
        expiration_days: 10,
      })
    ).toBe(true);
    expect(
      availabilityLib.validateFields({
        name: "Test availability",
        option: "option-id",
        pricings: [],
        expiration_date: "2022-12-01",
        expiration_days: null,
      })
    ).toBe(true);
    expect(
      availabilityLib.validateFields({
        name: "Test availability",
        option: "option-id",
        pricings: [],
        date_range: {
          from: "2022-12-21",
        },
        days: {},
      })
    ).toBe(false);
    expect(
      availabilityLib.validateFields({
        name: "Test availability",
        option: "option-id",
        pricings: [],
        date_range: {
          to: "2022-12-21",
        },
        days: {},
      })
    ).toBe(false);
    expect(
      availabilityLib.validateFields({
        name: "Test availability",
        option: "option-id",
        pricings: [],
        date_range: {
          from: "2022-12-21",
          to: "2022-12-21",
        },
        days: {},
      })
    ).toBe(true);
  });

  test("getDefaultAvailabilityFields", () => {
    expect(
      availabilityLib.getDefaultAvailabilityFields("test-option", ExperienceType.CALENDAR_TIMESLOTS)
    ).toStrictEqual({
      cardId: "test-uuid",
      isOpen: true,
      isValid: false,
      value: {
        days: {},
        option: "test-option",
        date_range: { from: undefined, to: undefined },
        name: "",
      },
    });
    expect(
      availabilityLib.getDefaultAvailabilityFields("test-option", ExperienceType.NO_CALENDAR_FIXED_END)
    ).toStrictEqual({
      cardId: "test-uuid",
      isOpen: true,
      isValid: false,
      value: {
        option: "test-option",
        expiration_date: null,
        expiration_days: null,
        name: "",
        pricings: [],
        languages: [],
      },
    });
  });
});

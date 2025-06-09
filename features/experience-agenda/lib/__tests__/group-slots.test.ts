import { describe, expect, test } from "vitest";
import { Slot, TimeSliceSlotType } from "../../types/Agenda";
import { groupByAggregationId, groupByDate, groupByTimesliceId } from "../group-slots";

describe("groupByDate", () => {
  test("groups an array of slots by their date property", () => {
    const slots = [
      { date: "2022-03-17", bookings: 2 },
      { date: "2022-03-17", bookings: 1 },
      { date: "2022-03-18", bookings: 3 },
      { date: "2022-03-19", bookings: 1 },
    ];

    const expected = [
      {
        date: "2022-03-17",
        slots: [
          { date: "2022-03-17", bookings: 2 },
          { date: "2022-03-17", bookings: 1 },
        ],
      },
      { date: "2022-03-18", slots: [{ date: "2022-03-18", bookings: 3 }] },
      { date: "2022-03-19", slots: [{ date: "2022-03-19", bookings: 1 }] },
    ];

    expect(groupByDate(slots as TimeSliceSlotType[])).toEqual(expected);
  });
});

describe("groupByAggregationId", () => {
  test("groups an array of slots by their aggregation_id property", () => {
    const slots = [
      { aggregation_id: "a", bookings: 2 },
      { aggregation_id: "b", bookings: 1 },
      { aggregation_id: "a", bookings: 3 },
      { aggregation_id: "c", bookings: 1 },
    ];

    const expected = [
      { aggregation_id: "a", bookings: 5 },
      { aggregation_id: "b", bookings: 1 },
      { aggregation_id: "c", bookings: 1 },
    ];

    expect(groupByAggregationId(slots as Slot[])).toEqual(expected);
  });
});

describe("groupByTimesliceId", () => {
  test("groups an array of slots by their timeslice_id property", () => {
    const slots = [
      {
        timeslice_id: "a",
        bookings: 2,
        remaining_capacity: 3,
        total_capacity: 5,
      },
      {
        timeslice_id: "b",
        bookings: 1,
        remaining_capacity: 1,
        total_capacity: 2,
      },
      {
        timeslice_id: "a",
        bookings: 3,
        remaining_capacity: 2,
        total_capacity: 5,
      },
      {
        timeslice_id: "c",
        bookings: 1,
        remaining_capacity: 4,
        total_capacity: 4,
      },
    ];

    const expected = [
      {
        timeslice_id: "a",
        bookings: 5,
        remaining_capacity: 5,
        total_capacity: 10,
        aggregationSlots: [
          {
            timeslice_id: "a",
            bookings: 2,
            remaining_capacity: 3,
            total_capacity: 5,
          },
          {
            timeslice_id: "a",
            bookings: 3,
            remaining_capacity: 2,
            total_capacity: 5,
          },
        ],
      },
      {
        timeslice_id: "b",
        bookings: 1,
        remaining_capacity: 1,
        total_capacity: 2,
        aggregationSlots: [
          {
            timeslice_id: "b",
            bookings: 1,
            remaining_capacity: 1,
            total_capacity: 2,
          },
        ],
      },
      {
        timeslice_id: "c",
        bookings: 1,
        remaining_capacity: 4,
        total_capacity: 4,
        aggregationSlots: [
          {
            timeslice_id: "c",
            bookings: 1,
            remaining_capacity: 4,
            total_capacity: 4,
          },
        ],
      },
    ];

    expect(groupByTimesliceId(slots as Slot[])).toEqual(expected);
  });
});

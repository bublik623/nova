import { describe, expect, test } from "vitest";
import { AgendaFilters } from "../../types/agenda";
import { generateOptions } from "../generate-options";

const range = {
  from: new Date("2022-01-01"),
  to: new Date("2022-01-31"),
};

describe("getOptionsWithFilters", () => {
  test("range - no excluded", () => {
    const filters: AgendaFilters = {
      range,
      excludedDates: [],
      type: "RANGE",
      selectedDates: [],
      selectedOptions: [],
      selectedTimeslots: [],
      onlyClosedSlots: false,
    };

    const expectedOptions = {
      config: {
        params: {
          start_date: "2022-01-01",
          end_date: "2022-01-31",
        },
      },
    };

    const result = generateOptions(filters);
    expect(result).toStrictEqual(expectedOptions);
  });

  test("range - excluded", () => {
    const filters: AgendaFilters = {
      range,
      excludedDates: [new Date("2022-01-11")],
      type: "RANGE",
      selectedDates: [new Date("2022-01-14")],
      selectedOptions: [],
      selectedTimeslots: [],
      onlyClosedSlots: false,
    };

    const expectedOptions = {
      config: {
        params: {
          start_date: "2022-01-01",
          end_date: "2022-01-31",
          filters: "date=out=(2022-01-11)",
        },
      },
    };

    const result = generateOptions(filters);
    expect(result).toStrictEqual(expectedOptions);
  });

  test("single", () => {
    const filters: AgendaFilters = {
      range,
      excludedDates: [new Date("2022-01-11")],
      type: "SINGLE",
      selectedDates: [new Date("2022-01-14"), new Date("2022-01-18")],
      selectedOptions: [],
      selectedTimeslots: [],
      onlyClosedSlots: false,
    };

    const expectedOptions = {
      config: {
        params: {
          start_date: "2022-01-01",
          end_date: "2022-01-31",
          filters: "date=in=(2022-01-14,2022-01-18)",
        },
      },
    };

    const result = generateOptions(filters);
    expect(result).toStrictEqual(expectedOptions);
  });

  test("options", () => {
    const filters: AgendaFilters = {
      range,
      excludedDates: [],
      type: "RANGE",
      selectedDates: [],
      selectedOptions: [
        { value: "option-1", label: "Option 1" },
        { value: "option-2", label: "Option 2" },
      ],
      selectedTimeslots: [],
      onlyClosedSlots: false,
    };

    const expectedOptions = {
      config: {
        params: {
          start_date: "2022-01-01",
          end_date: "2022-01-31",
          filters: "option.id=in=(option-1,option-2)",
        },
      },
    };

    const result = generateOptions(filters);
    expect(result).toStrictEqual(expectedOptions);
  });

  test("timeslots", () => {
    const filters: AgendaFilters = {
      range,
      excludedDates: [],
      type: "RANGE",
      selectedDates: [],
      selectedOptions: [],
      selectedTimeslots: [
        { value: "12:00:00", label: "12:00" },
        { value: "18:00:00", label: "18:00" },
      ],
      onlyClosedSlots: false,
    };

    const expectedOptions = {
      config: {
        params: {
          start_date: "2022-01-01",
          end_date: "2022-01-31",
          filters: "time=in=(12:00:00,18:00:00)",
        },
      },
    };

    const result = generateOptions(filters);
    expect(result).toStrictEqual(expectedOptions);
  });

  test("show only closed", () => {
    const filters: AgendaFilters = {
      range,
      excludedDates: [],
      type: "RANGE",
      selectedDates: [],
      selectedOptions: [],
      selectedTimeslots: [],
      onlyClosedSlots: true,
    };

    const expectedOptions = {
      config: {
        params: {
          start_date: "2022-01-01",
          end_date: "2022-01-31",
          filters: "enabled=in=(false)",
        },
      },
    };

    const result = generateOptions(filters);
    expect(result).toStrictEqual(expectedOptions);
  });
});

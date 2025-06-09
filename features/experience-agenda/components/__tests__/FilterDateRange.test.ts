import { describe, test, expect } from "vitest";
import { mount, config } from "@vue/test-utils";
import FilterDateRange, { Props } from "../FilterDateRange.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

const props: Props = {
  range: {},
  excludedDates: [],
};

const selectors = {
  dateInput: "[data-testid='agenda-date-filter-input-input-date-input']",
  calendar: "[data-testid='agenda-date-filter-input-input-date-calendar']",
  dateBtn: "[data-testid='date-card']",
  scheduleDay: "[data-testid='schedule-day']",
  clearBtn: "[data-testid='agenda-date-filter-clear']",
};

const fakeDateStart = new Date(2100, 10, 10);
const fakeDateEnd = new Date(2100, 10, 13);

describe("FilterDateRange", () => {
  test("it should render correctly", () => {
    const wrapper = mount(FilterDateRange, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.findAll(selectors.dateInput).length).toBe(2);
    expect(wrapper.find(selectors.clearBtn).exists()).toBe(true);
    expect(wrapper.findAll(selectors.scheduleDay).length).toBe(7);
  });

  describe("when the user deselects a day from the schedule", () => {
    test("it should emit an event with the updated excluded dates", async () => {
      const wrapper = mount(FilterDateRange, {
        props: { ...props, range: { from: fakeDateStart, to: fakeDateEnd } },
      });

      await wrapper.find("#checkbox-Fri").trigger("click");
      await wrapper.find("#checkbox-Thu").trigger("click");

      const events = wrapper.emitted<Event[]>()["update:excludedDates"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toEqual([new Date(2100, 10, 12)]);
      expect(events[1][0]).toEqual([new Date(2100, 10, 11), new Date(2100, 10, 12)]);
    });
  });

  describe("if the user clicks on the clear button", () => {
    test("it should emit an event resetting the values", async () => {
      const wrapper = mount(FilterDateRange, {
        props: {
          ...props,
          range: { from: fakeDateStart, to: fakeDateEnd },
          excludedDates: [new Date(2100, 10, 12)],
        },
      });

      await wrapper.find(selectors.clearBtn).trigger("click");

      const events = wrapper.emitted<Event[]>();
      expect(events).toBeTruthy();
      expect(events["update:selectedRange"][0][0]).toEqual({});
      expect(events["update:excludedDates"][0][0]).toEqual([]);
    });
  });
});

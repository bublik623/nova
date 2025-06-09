import { describe, test, expect } from "vitest";
import { mount, config } from "@vue/test-utils";
import FilterDateSingle, { Props } from "../FilterDateSingle.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

const props: Props = {
  dates: [],
};

const selectors = {
  calendar: "[data-testid='nova-date-picker']",
  dateChip: "[data-testid='agenda-date-filter-date-chip']",
  clearBtn: "[data-testid='agenda-date-filter-clear']",
};

describe("FilterDateSingle", () => {
  test("it should render correctly", () => {
    const wrapper = mount(FilterDateSingle, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.calendar).exists()).toBe(true);
    expect(wrapper.find(selectors.clearBtn).exists()).toBe(true);
    expect(wrapper.find(selectors.clearBtn).attributes().disabled).toBe("");
  });

  describe("if the user clicks on one of the date chips", () => {
    test("it should emit an event updating the dates", async () => {
      const wrapper = mount(FilterDateSingle, {
        props: {
          dates: [new Date(2100, 10, 10), new Date(2100, 10, 12)],
        },
      });

      await wrapper.findAll(selectors.dateChip)[0].find("button").trigger("click");

      const events = wrapper.emitted<Event[]>()["update:dates"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toStrictEqual([new Date(2100, 10, 12)]);
    });
  });

  describe("if the user clicks on the clear button", () => {
    test("it should emit an event resetting the values", async () => {
      const wrapper = mount(FilterDateSingle, {
        props: {
          dates: [new Date(2100, 10, 10)],
        },
      });

      await wrapper.find(selectors.clearBtn).trigger("click");

      const events = wrapper.emitted<Event[]>()["update:dates"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toEqual([]);
    });
  });
});

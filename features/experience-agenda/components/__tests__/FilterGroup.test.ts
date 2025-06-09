import { describe, test, expect, vi } from "vitest";
import { mount, config } from "@vue/test-utils";
import FilterGroup from "../FilterGroup.vue";
import { Stub } from "@vue/test-utils/dist/types";

const FilterDateSingleStub: Stub = {
  name: "FilterDateSingleStub",
  template: `
    <span 
      data-testid='date-single-filter'
      @click="$emit('update:dates', [
        new Date(2050, 1, 1)
      ])" 
    />`,
};

const FilterDateRangeStub: Stub = {
  name: "FilterDateRangeStub",
  template: `
    <span 
      data-testid="date-range-filter"
      @click="$emit('update:selectedRange', {
        from: new Date(2050, 1, 1),
        to: new Date(2060, 1, 1),
      })" 
    />`,
};

config.global.stubs = {
  FilterDateRange: FilterDateRangeStub,
  FilterDateSingle: FilterDateSingleStub,
};

config.global.mocks = {
  $t: (s: string) => s,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const defaultFilters = {
  excludedDates: [],
  onlyClosedSlots: false,
  range: {
    from: new Date(2050, 1, 1),
    to: new Date(2060, 1, 1),
  },
  selectedDates: [],
  selectedOptions: [],
  selectedTimeslots: [],
  type: "RANGE",
};

const props = {
  slots: [
    { option: { id: "option-1", name: "Option 1" }, time: "11:00" },
    { option: { id: "option-1", name: "Option 1" }, time: "15:00" },
    { option: { id: "option-2", name: "Option 2" }, time: "09:00" },
  ],
};

const selectors = {
  radioCardSingle: "[data-testid='input-radio-SINGLE']",
  dateRangeFilter: "[data-testid='date-range-filter']",
  singleDateFilter: "[data-testid='date-single-filter']",
  optionsFilter: "[data-testid='options-filter']",
  timeslotsFilter: "[data-testid='timeslots-filter']",
  closedItemsCheckbox: "[data-testid='closed-items-checkbox']",
  filtersSummary: "[data-testid='filters-summary']",
  applyFiltersBtn: "[data-testid='agenda-date-filter-apply']",
};

describe("FilterGroup", () => {
  test("it should render correctly", async () => {
    const wrapper = mount(FilterGroup, { props: props as any });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.dateRangeFilter).exists()).toBe(true);
    expect(wrapper.find(selectors.singleDateFilter).exists()).toBe(false);
    expect(wrapper.find(selectors.optionsFilter).exists()).toBe(true);
    expect(wrapper.find(selectors.timeslotsFilter).exists()).toBe(true);
    expect(wrapper.find(selectors.closedItemsCheckbox).exists()).toBe(true);
    expect(wrapper.find(selectors.applyFiltersBtn).exists()).toBe(true);
    expect(wrapper.find(selectors.applyFiltersBtn).attributes().disabled).toBe("");
    expect(wrapper.find(selectors.filtersSummary).text()).toContain("experience.availability.dates.title");
    expect(wrapper.find(selectors.filtersSummary).text()).toContain("experience.agenda.filters.options.title");
    expect(wrapper.find(selectors.filtersSummary).text()).toContain("experience.agenda.filters.timeslots.title");
  });

  describe("when the hideDatesFilter prop is set to true", () => {
    test("it should hide the dates filter", async () => {
      const wrapper = mount(FilterGroup, {
        props: { ...props, hideDateFilter: true } as any,
      });

      expect(wrapper.find(selectors.dateRangeFilter).exists()).toBe(false);
      expect(wrapper.find(selectors.singleDateFilter).exists()).toBe(false);

      expect(wrapper.find(selectors.filtersSummary).text()).not.toContain("experience.availability.dates.title");
    });
  });

  describe("when the hideTimeslotFilter prop is set to true", () => {
    test("it should hide the timeslots filter", () => {
      const wrapper = mount(FilterGroup, {
        props: { ...props, hideTimeslotFilter: true } as any,
      });

      expect(wrapper.find(selectors.timeslotsFilter).exists()).toBe(false);

      expect(wrapper.find(selectors.filtersSummary).text()).not.toContain("experience.agenda.filters.timeslots.title");
    });
  });

  describe("when the user selects 'single dates' as option", () => {
    test("it should show the single dates fitler", async () => {
      const wrapper = mount(FilterGroup, { props: props as any });

      await wrapper.find(selectors.radioCardSingle).trigger("change");

      expect(wrapper.find(selectors.dateRangeFilter).exists()).toBe(false);
      expect(wrapper.find(selectors.singleDateFilter).exists()).toBe(true);
    });
  });

  describe("when the range of dates is updated", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(FilterGroup, { props: props as any });

      await wrapper.find(selectors.dateRangeFilter).trigger("click");

      const events = wrapper.emitted<Event[]>()["update:dates"];

      expect(events).toBeTruthy();
      expect(events.length).toBe(1);
      expect(events[0][0]).toEqual(defaultFilters);
    });
  });

  describe("when the a single date is updated", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(FilterGroup, { props: props as any });

      await wrapper.find(selectors.radioCardSingle).trigger("change");
      await wrapper.find(selectors.singleDateFilter).trigger("click");

      const events = wrapper.emitted<Event[]>()["update:dates"];

      expect(events).toBeTruthy();
      expect(events.length).toBe(1);
      expect(events[0][0]).toEqual({
        ...defaultFilters,
        type: "SINGLE",
        range: {
          from: new Date(2050, 1, 1),
          to: new Date(2050, 1, 1),
        },
        selectedDates: [new Date(2050, 1, 1)],
      });
    });
  });

  describe("when the options filter is updated", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(FilterGroup, { props: props as any });

      await wrapper.find(selectors.dateRangeFilter).trigger("click");
      await wrapper.find(selectors.optionsFilter).find("button").trigger("click");
      const option1Checkbox = wrapper.findAll("[data-testid='multi-select-item']")[1].find("input");
      await option1Checkbox.trigger("click");

      await wrapper.find(selectors.applyFiltersBtn).trigger("click");

      const events = wrapper.emitted<Event[]>()["apply:filters"];

      expect(events).toBeTruthy();
      expect(events.length).toBe(1);
      expect(events[0][0]).toEqual({
        ...defaultFilters,
        selectedOptions: [
          {
            label: "Option 2",
            value: "option-2",
          },
        ],
      });
    });
  });

  describe("when the timeslots filter is updated", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(FilterGroup, { props: props as any });

      await wrapper.find(selectors.dateRangeFilter).trigger("click");
      await wrapper.find(selectors.timeslotsFilter).find("button").trigger("click");
      const option1Checkbox = wrapper.findAll("[data-testid='multi-select-item']")[1].find("input");
      await option1Checkbox.trigger("click");

      await wrapper.find(selectors.applyFiltersBtn).trigger("click");

      const events = wrapper.emitted<Event[]>()["apply:filters"];

      expect(events).toBeTruthy();
      expect(events.length).toBe(1);
      expect(events[0][0]).toEqual({
        ...defaultFilters,
        selectedTimeslots: [
          {
            label: "15:00",
            value: "15:00",
          },
        ],
      });
    });
  });

  describe("when the filters are applied", () => {
    test("it should collapse the filters container and show a summary", async () => {
      const wrapper = mount(FilterGroup, { props: props as any });

      await wrapper.find(selectors.dateRangeFilter).trigger("click");
      await wrapper.find(selectors.applyFiltersBtn).trigger("click");

      expect(wrapper.find(selectors.filtersSummary).isVisible()).toBe(true);
      expect(wrapper.find(selectors.filtersSummary).text()).toContain("From: 01/02/50  To: 01/02/60");
      expect(wrapper.find(selectors.filtersSummary).text()).toContain("experience.agenda.filters.options.all");
      expect(wrapper.find(selectors.filtersSummary).text()).toContain("experience.agenda.filters.timeslots.all");
    });
  });
});

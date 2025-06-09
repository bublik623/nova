import { describe, test, expect, beforeEach, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import NovaDatePicker, { Props } from "./NovaDatePicker.vue";

const formatter = new Intl.DateTimeFormat("en-GB", { month: "long" });

const selectors = {
  calendar: "[data-testid='nova-date-picker']",
  prevMonthBtn: "[data-testid='prev-month']",
  nextMonthBtn: "[data-testid='next-month']",
  dateBtn: "[data-testid='date-card']",
};

const fakeDate = new Date(2100, 10, 10);

const props: Props = {
  dates: [fakeDate],
  mode: "single",
};

describe("NovaDatePicker", () => {
  test("it renders correctly", () => {
    const wrapper = mount(NovaDatePicker, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.calendar).exists()).toBe(true);
  });

  describe("when the user changes the month", () => {
    test("it should update the date preview", async () => {
      const today = new Date();
      today.setDate(10);
      const wrapper = mount(NovaDatePicker, {
        props: { ...props, dates: [today] },
      });

      expect(wrapper.find(selectors.calendar).text()).toContain(formatter.format(today));

      await wrapper.find(selectors.nextMonthBtn).trigger("click");
      expect(wrapper.find(selectors.calendar).text()).toContain(formatter.format(today.setMonth(today.getMonth() + 1)));

      await wrapper.find(selectors.nextMonthBtn).trigger("click");
      expect(wrapper.find(selectors.calendar).text()).toContain(formatter.format(today.setMonth(today.getMonth() + 1)));

      await wrapper.find(selectors.prevMonthBtn).trigger("click");
      await wrapper.find(selectors.prevMonthBtn).trigger("click");
      await wrapper.find(selectors.prevMonthBtn).trigger("click");
      expect(wrapper.find(selectors.calendar).text()).toContain(formatter.format(today.setMonth(today.getMonth() - 2)));
    });
  });

  describe("when the user selects a date", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(NovaDatePicker, { props });

      const dates = wrapper.findAll(selectors.dateBtn);
      expect(dates.length).toBe(35);
      await dates[20].trigger("click");

      const events = wrapper.emitted<Event[]>()["select:dates"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toEqual([new Date(2100, 10, 21)]);
    });
  });

  describe("when the component is configured to support multiple selection", () => {
    test("it should allow to select multiple dates", async () => {
      const wrapper = mount(NovaDatePicker, {
        props: { ...props, mode: "multiple" },
      });

      const dates = wrapper.findAll(selectors.dateBtn);
      expect(dates.length).toBe(35);
      await dates[20].trigger("click");

      const events = wrapper.emitted<Event[]>()["select:dates"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toEqual([fakeDate, new Date(2100, 10, 21)]);
    });
  });

  describe("when the component is configured to support range selection", () => {
    test("it should allow to select a range of dates", async () => {
      const wrapper = mount(NovaDatePicker, {
        props: { ...props, mode: "range", selectingDate: "FROM" },
      });

      const dates = wrapper.findAll(selectors.dateBtn);
      expect(dates.length).toBe(35);

      await dates[20].trigger("click");
      await wrapper.setProps({
        dates: [new Date(2100, 10, 21)],
        selectingDate: "TO",
      });
      await dates[24].trigger("click");

      const selectDateEvents = wrapper.emitted<Event[]>()["select:dates"];
      expect(selectDateEvents).toBeTruthy();
      expect(selectDateEvents[0][0]).toEqual([new Date(2100, 10, 21)]);
      expect(selectDateEvents[1][0]).toEqual([new Date(2100, 10, 21), new Date(2100, 10, 25)]);

      const updateSelectingDateEvents = wrapper.emitted<Event[]>()["update:selectingDate"];
      expect(updateSelectingDateEvents).toBeTruthy();
      expect(updateSelectingDateEvents[0][0]).toEqual("TO");
      expect(updateSelectingDateEvents[1][0]).toEqual("FROM");
    });

    describe("if maxMonthTimespan prop is set", () => {
      test("it should disable all dates outside that timespan based on the first selected date", async () => {
        const wrapper = mount(NovaDatePicker, {
          props: {
            ...props,
            mode: "range",
            selectingDate: "FROM",
            maxMonthsTimespan: 1,
          },
        });

        let dates = wrapper.findAll(selectors.dateBtn);
        await dates[20].trigger("click");
        await wrapper.setProps({
          dates: [new Date(2100, 10, 21)],
          selectingDate: "TO",
        });

        await wrapper.find(selectors.nextMonthBtn).trigger("click");
        dates = wrapper.findAll(selectors.dateBtn);
        expect(dates[2].attributes().disabled).toBe(undefined);
        expect(dates[25].attributes().disabled).toBe("");
      });
    });
  });

  describe("when the component can select all dates", () => {
    const today = new Date(1992, 11, 22);
    beforeEach(() => {
      vi.useFakeTimers();

      vi.setSystemTime(today);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("without canSelectAllDates and a given date, it should not allow to select dates in the past", async () => {
      const wrapper = mount(NovaDatePicker, {
        props: { ...props, dates: [today] },
      });

      const dates = wrapper.findAll(selectors.dateBtn);

      expect(dates[2].attributes().disabled).toBe("");
      expect(dates[25].attributes().disabled).not.toBe("");

      await dates[9].trigger("click");

      const events = wrapper.emitted<Event[]>()["select:dates"];
      expect(events).toBeFalsy();
    });

    test("with canSelectAllDates and a given date, it should allow to select all dates", async () => {
      const nextFakeDate = new Date(2100, 10, 11);

      const wrapper = mount(NovaDatePicker, {
        props: { ...props, canSelectAllDates: true, dates: [fakeDate] },
      });

      const dates = wrapper.findAll(selectors.dateBtn);

      expect(dates[2].attributes().disabled).toBe(undefined);
      expect(dates[25].attributes().disabled).toBe(undefined);

      // Index number 10 is the nextFakeDate
      await dates[10].trigger("click");

      const events = wrapper.emitted<Event[]>()["select:dates"];
      expect(events[0][0]).toEqual([nextFakeDate]);
    });
  });
});

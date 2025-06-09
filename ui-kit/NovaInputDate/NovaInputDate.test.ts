import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NovaInputDate, { Props } from "./NovaInputDate.vue";

const props: Props = {
  id: "test",
  singleDateSelector: true,
};

const selectors = {
  input: `[data-testid="${props.id}-input-date-input"]`,
  calendar: `[data-testid="${props.id}-input-date-calendar"]`,
  prevMonthBtn: "[data-testid='prev-month']",
  nextMonthBtn: "[data-testid='next-month']",
  dateBtn: "[data-testid='date-card']",
  clearBtn: "[data-testid='input-date-clear-button']",
};

const fakeDate = new Date(2100, 10, 10);
const fakeDateString = new Intl.DateTimeFormat("en-gb").format(fakeDate);

describe("NovaInputDate", () => {
  test("it renders correctly", () => {
    const wrapper = mount(NovaInputDate, { props });

    const inputs = wrapper.findAll(selectors.input);
    expect(inputs.length).toBe(1);
    expect(inputs[0].text()).toContain("From");
    expect(inputs[0].text()).toContain("dd/mm/yyyy");
    expect(wrapper.find(".DateInput__input").attributes().invalid).toBe(undefined);
  });

  test("it should hide labels when `hideLabel` prop is passed", async () => {
    const wrapper = mount(NovaInputDate, {
      props: { ...props, singleDateSelector: false },
    });

    const inputs = wrapper.findAll(selectors.input);
    expect(inputs[0].text()).toContain("From");
    expect(inputs[1].text()).toContain("To");

    await wrapper.setProps({ hideLabel: true });
    expect(inputs[0].text()).not.toContain("From");
    expect(inputs[1].text()).not.toContain("To");
  });

  describe("when the selected date is passed as prop", () => {
    test("it should display it by default", async () => {
      const wrapper = mount(NovaInputDate, {
        props: { ...props, modelValue: { from: fakeDate } },
      });

      expect(wrapper.find(selectors.input).text()).toContain(fakeDateString);

      await wrapper.find(selectors.input).trigger("click");
      const dates = wrapper.findAll(selectors.dateBtn);

      expect(dates[9].find("div").attributes().selected).toBeTruthy();
    });
  });

  describe("when the user clicks on the input", () => {
    test("it should open the calendar", async () => {
      const wrapper = mount(NovaInputDate, { props });

      await wrapper.find(selectors.input).trigger("click");
      expect(wrapper.find(selectors.calendar).isVisible()).toBe(true);

      await wrapper.find(selectors.input).trigger("click");
      expect(wrapper.find(selectors.calendar).exists()).toBe(false);

      await wrapper.find(selectors.input).trigger("click");
      expect(wrapper.find(selectors.calendar).isVisible()).toBe(true);
    });

    describe("when the user clicks outside the component", () => {
      test("it should close the calendar", async () => {
        const App = defineComponent({
          components: { NovaInputDate },
          setup() {
            return {
              props,
            };
          },
          template: `
            <div>
              <div id="outside">SomeOtherDiv</div>
              <NovaInputDate v-bind="props" />
            </div>
          `,
        });

        const wrapper = mount(App, { attachTo: document.body });

        await wrapper.find(selectors.input).trigger("click");
        expect(wrapper.find(selectors.calendar).isVisible()).toBe(true);

        await wrapper.find("#outside").trigger("click");
        expect(wrapper.find(selectors.calendar).exists()).toBe(false);
      });
    });
  });

  describe("when the user selects a date", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(NovaInputDate, { props });
      await wrapper.setProps({
        modelValue: { from: fakeDate },
      });

      await wrapper.find(selectors.input).trigger("click");

      const dates = wrapper.findAll(selectors.dateBtn);
      expect(dates.length).toBe(35);
      await dates[20].trigger("click");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toEqual({
        from: new Date(2100, 10, 21),
      });
    });
  });

  describe("when the input is configured as a range selector", () => {
    test("it should show two inputs", () => {
      const wrapper = mount(NovaInputDate, {
        props: { ...props, singleDateSelector: false },
      });

      const inputs = wrapper.findAll(selectors.input);
      expect(inputs.length).toBe(2);
      expect(inputs[0].text()).toContain("From");
      expect(inputs[0].text()).toContain("dd/mm/yyyy");
      expect(inputs[1].text()).toContain("To");
      expect(inputs[1].text()).toContain("dd/mm/yyyy");
    });

    describe("when the selected date is passed as prop", () => {
      test("it should display it by default", async () => {
        const newDate = new Date(fakeDate.getTime());
        newDate.setDate(12);
        const wrapper = mount(NovaInputDate, {
          props: {
            ...props,
            modelValue: { from: fakeDate, to: newDate },
            singleDateSelector: false,
          },
        });

        expect(wrapper.find(selectors.input).text()).toContain(fakeDateString);

        await wrapper.find(selectors.input).trigger("click");
        const dates = wrapper.findAll(selectors.dateBtn);

        expect(dates[9].attributes()["range-start"]).toBeTruthy();
        expect(dates[9].find("div").attributes().selected).toBeTruthy();
        expect(dates[10].attributes()["in-range"]).toBeTruthy();
        expect(dates[11].find("div").attributes().selected).toBeTruthy();
        expect(dates[11].attributes()["range-end"]).toBeTruthy();
      });
    });
  });

  describe("is it's invalid", () => {
    test("it should have a custom attribute", () => {
      const wrapper = mount(NovaInputDate, {
        props: { ...props, isInvalid: true },
      });

      expect(wrapper.find(".DateInput__input").attributes().invalid).toBe("true");
    });
  });
});

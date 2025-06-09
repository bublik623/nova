import { mount } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import NovaRadioCard, { Props } from "./NovaRadioCard.vue";

const props: Props = {
  checked: false,
  title: "card-title",
  value: "option_value",
};

const slots = {
  description: `Eg. (including all ticket holder types and languages)
<ul>
  <li>Start time 9:00am</li>
  <li>Capacity - X spots</li>
</ul>`,
};

const selectors = {
  radio: "[data-testid='input-radio-option_value']",
  card: "[data-testid='radio-card-option_value']",
};

describe("NovaRadioCard", () => {
  test("it should mount and render correctly", () => {
    const wrapper = mount(NovaRadioCard, { props, slots });

    expect(wrapper.find(selectors.card).exists()).toBeTruthy();
    expect(wrapper.find(selectors.radio).exists()).toBeTruthy();

    expect(wrapper.text()).include("card-title");
    expect(wrapper.text()).include(`Eg. (including all ticket holder types and languages)`);
    expect(wrapper.text()).include(`Start time 9:00am`);
    expect(wrapper.text()).include(`Capacity - X spots`);
  });

  describe("when the disabled prop is set to true", () => {
    test("it should disable the component", async () => {
      const wrapper = mount(NovaRadioCard, {
        props: { ...props, disabled: true },
      });

      expect(wrapper.find(selectors.card).attributes().disabled).toBe("true");

      // check if is not emitting the event
      await wrapper.find(selectors.radio).trigger("change");

      const events = wrapper.emitted<Event[]>().input;
      expect(events).toBeFalsy();
    });
  });

  describe("when the input radio is clicked", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(NovaRadioCard, {
        props,
      });

      await wrapper.find(selectors.radio).trigger("change");

      const events = wrapper.emitted<Event[]>().input;
      expect(events).toBeTruthy();
      expect(events[0][0]).toBe(props.value);
    });
    test("it should be checked when the checked prop is passed", () => {
      const wrapper = mount(NovaRadioCard, {
        props: { ...props, checked: true },
      });
      const input = wrapper.find<HTMLInputElement>(selectors.radio);

      expect(wrapper.find(selectors.card).attributes().checked).toBe("true");
      expect(input.element.checked).toBe(true);
    });
  });
});

import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NovaInputNumber, { Props } from "./NovaInputNumber.vue";

const props: Props = {
  id: "test-id",
  minValue: 10,
  maxValue: 100,
};

const selectors = {
  input: `input[data-testid='${props.id}-input-number']`,
  readonly: `[data-testid='${props.id}-input-number-readonly']`,
};

describe("NovaInputNumber", () => {
  test("it should render correctly", () => {
    const wrapper = mount(NovaInputNumber, {
      props: { ...props, placeholder: "10" },
    });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.input).exists()).toBe(true);
    expect(wrapper.find(selectors.input).attributes().placeholder).toBe("10");
  });

  describe("when the user inputs a number", () => {
    test("it should emit an event", () => {
      const wrapper = mount(NovaInputNumber, { props });

      const input = wrapper.find(selectors.input);
      input.setValue(15);

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events[0][0]).toBe(15);
    });

    describe("if the number is out of range", () => {
      test("it should emit the minimum or maximum value", () => {
        const wrapper = mount(NovaInputNumber, { props });

        const input = wrapper.find(selectors.input);
        input.setValue(props.minValue - 10);

        let events = wrapper.emitted<Event[]>()["update:modelValue"];
        expect(events[0][0]).toBe(props.minValue);

        if (props.maxValue) {
          input.setValue(props.maxValue + 10);

          events = wrapper.emitted<Event[]>()["update:modelValue"];
          expect(events[1][0]).toBe(props.maxValue);
        }
      });
    });

    describe("if the value is not a number", () => {
      test("it should not emit an event", () => {
        const wrapper = mount(NovaInputNumber, { props });

        const input = wrapper.find(selectors.input);
        input.setValue("hello");

        const events = wrapper.emitted<Event[]>()["update:modelValue"];
        expect(events).toBeFalsy();
      });
    });
  });

  describe("when the `step` attribute is provided", () => {
    test("it should emit an event with decimal value", () => {
      const wrapper = mount(NovaInputNumber, {
        props: { ...props, step: ".01" },
      });

      const input = wrapper.find(selectors.input);
      input.setValue(15.9);

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events[0][0]).toBe(15.9);
    });

    describe("if the number is out of range", () => {
      test("it should emit the minimum or maximum value", () => {
        const wrapper = mount(NovaInputNumber, {
          props: { ...props, step: ".01", maxValue: 1.5, minValue: 0.8 },
        });

        const input = wrapper.find(selectors.input);
        input.setValue(0.6);

        let events = wrapper.emitted<Event[]>()["update:modelValue"];
        expect(events[0][0]).toBe(0.8);

        input.setValue(1.7);

        events = wrapper.emitted<Event[]>()["update:modelValue"];
        expect(events[1][0]).toBe(1.5);
      });
    });
  });

  describe("when the input is invalid", () => {
    test("renders correctly", async () => {
      const wrapper = mount(NovaInputNumber, { props });

      const input = wrapper.find(selectors.input);

      expect(input.attributes()["data-invalid"]).toBe(undefined);

      await wrapper.setProps({ isInvalid: false });
      expect(input.attributes()["data-invalid"]).toBe(undefined);

      await wrapper.setProps({ isInvalid: true });
      expect(input.attributes()["data-invalid"]).toBe("true");
    });
  });
  describe("if the readonly prop is true", () => {
    test("it should render the readonly element", () => {
      const wrapper = mount(NovaInputNumber, { props: { ...props, readonly: true } });
      expect(wrapper.find(selectors.readonly).exists()).toBe(true);
    });
  });
});

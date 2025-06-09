import { mount } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import NovaTextarea, { Props } from "./NovaTextarea.vue";

const props: Props = {
  id: "test",
  modelValue: "Test",
  placeholder: "Enter some text",
};

const selectors = {
  input: "textarea[data-testid='test-input-text']",
  icon: "svg[data-testid='icon-search']",
  error: "[data-testid='test-input-text-error']",
  label: "[data-testid='test-input-text-label']",
  clearBtn: "[data-testid='test-input-text-clear-btn']",
  container: "[data-testid='test-input-text-container']",
  successIcon: "[data-testid='input-text-success-icon']",
  errorIcon: "[data-testid='input-text-error-icon']",
};

describe("NovaInputText", () => {
  test("it should mount and render correctly", () => {
    const wrapper = mount(NovaTextarea, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.input).exists()).toBe(true);
    expect(wrapper.find(selectors.input).attributes().placeholder).toBe(props.placeholder);
  });

  test("it should mount and render correctly", () => {
    const wrapper = mount(NovaTextarea, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.input).exists()).toBe(true);
    expect(wrapper.find(selectors.input).attributes().placeholder).toBe(props.placeholder);
  });

  describe("when the user inputs some text", () => {
    test("it should emit an event with the correct value", () => {
      const wrapper = mount(NovaTextarea, { props });

      const input = wrapper.find(selectors.input);
      input.setValue("test");

      const events = wrapper.emitted<Event[]>().input;
      expect((events[0][0].target as HTMLInputElement).value).toBe("test");
    });
  });

  describe("when an error message is passed as prop", () => {
    test("it should render it", () => {
      const wrapper = mount(NovaTextarea, {
        props: { ...props, error: "test error" },
      });

      expect(wrapper.find(selectors.error).exists()).toBe(true);
      expect(wrapper.find(selectors.error).text()).toBe("test error");
    });
  });

  describe("when label is passed as prop", () => {
    test("it should render it", () => {
      const wrapper = mount(NovaTextarea, {
        props: { ...props, label: "test label" },
      });

      expect(wrapper.find(selectors.label).exists()).toBe(true);
      expect(wrapper.find(selectors.label).text()).toBe("test label");
    });
  });

  describe("when the user click the clear button", () => {
    test("it should emit an empty string", async () => {
      const wrapper = mount(NovaTextarea, { props });

      const clearBtn = wrapper.find(selectors.clearBtn);
      await clearBtn.trigger("click");
      const events = wrapper.emitted<Event[]>()["update:modelValue"];

      expect(events[0][0]).toBe("");
    });
  });

  describe("when the size props is lg", () => {
    test("it should have lg class", () => {
      const wrapper = mount(NovaTextarea, {
        props: { ...props, size: "lg" },
      });

      expect(wrapper.find(selectors.container).attributes().size).toContain("lg");
    });
  });

  describe("it should render the themes correctly", () => {
    test("it renders the success theme", () => {
      const wrapper = mount(NovaTextarea, {
        props: { ...props, theme: "success" },
      });

      expect(wrapper.find(selectors.container).attributes().theme).toBe("success");

      expect(wrapper.find(selectors.successIcon).exists()).toBe(true);
    });

    test("it renders the error theme", () => {
      const wrapper = mount(NovaTextarea, {
        props: { ...props, theme: "error" },
      });

      expect(wrapper.find(selectors.container).attributes().theme).toBe("error");

      expect(wrapper.find(selectors.errorIcon).exists()).toBe(true);
    });

    test("if it has an error it forces the error theme", () => {
      const wrapper = mount(NovaTextarea, {
        props: { ...props, theme: "success", error: "Uh oh!" },
      });

      expect(wrapper.find(selectors.container).attributes().theme).toBe("error");

      expect(wrapper.find(selectors.errorIcon).exists()).toBe(true);
    });
  });
});

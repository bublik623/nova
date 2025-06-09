import { mount } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import NovaInputText, { Props } from "./NovaInputText.vue";

const props: Props = {
  id: "test",
  modelValue: "Test",
  placeholder: "Enter some text",
};

const selectors = {
  input: "input[data-testid='test-input-text']",
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
    const wrapper = mount(NovaInputText, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.input).exists()).toBe(true);
    expect(wrapper.find(selectors.input).attributes().placeholder).toBe(props.placeholder);
  });

  test("it should emit a click event when we click on the input", async () => {
    const wrapper = mount(NovaInputText, { props });

    const input = wrapper.find(selectors.input);
    await input.trigger("click");
    const events = wrapper.emitted<Event[]>()["click"];

    expect(events).toHaveLength(1);
  });

  describe("when the user inputs some text", () => {
    test("it should emit an event with the correct value", () => {
      const wrapper = mount(NovaInputText, { props });

      const input = wrapper.find(selectors.input);
      input.setValue("test");

      const events = wrapper.emitted<Event[]>().input;
      expect((events[0][0].target as HTMLInputElement).value).toBe("test");
    });
  });

  describe("when an error message is passed as prop", () => {
    test("it should render it", () => {
      const wrapper = mount(NovaInputText, {
        props: { ...props, error: "test error" },
      });

      expect(wrapper.find(selectors.error).exists()).toBe(true);
      expect(wrapper.find(selectors.error).text()).toBe("test error");
    });
  });

  describe("when the input is invalid", () => {
    test("renders correctly", async () => {
      const wrapper = mount(NovaInputText, { props });

      const input = wrapper.find(selectors.container);

      expect(input.attributes()["data-invalid"]).toBe(undefined);

      await wrapper.setProps({ isInvalid: false });
      expect(input.attributes()["data-invalid"]).toBe(undefined);

      await wrapper.setProps({ isInvalid: true });
      expect(input.attributes()["data-invalid"]).toBe("true");
    });
  });

  describe("when label is passed as prop", () => {
    test("it should render it", () => {
      const wrapper = mount(NovaInputText, {
        props: { ...props, label: "test label" },
      });

      expect(wrapper.find(selectors.label).exists()).toBe(true);
      expect(wrapper.find(selectors.label).text()).toBe("test label");
    });
  });

  describe("when the user click the clear button", () => {
    test("it should emit an empty string", async () => {
      const wrapper = mount(NovaInputText, { props });

      const clearBtn = wrapper.find(selectors.clearBtn);
      await clearBtn.trigger("click");
      const events = wrapper.emitted<Event[]>()["update:modelValue"];

      expect(events[0][0]).toBe("");
    });

    test("it should emit a clear event", async () => {
      const wrapper = mount(NovaInputText, { props });

      const clearBtn = wrapper.find(selectors.clearBtn);
      await clearBtn.trigger("click");
      const events = wrapper.emitted<Event[]>()["clear"];

      expect(events).toHaveLength(1);
    });
  });

  describe("when the size props is lg", () => {
    test("it should have lg class", () => {
      const wrapper = mount(NovaInputText, {
        props: { ...props, size: "lg" },
      });

      expect(wrapper.find(selectors.container).attributes().size).toContain("lg");
    });
  });

  describe("it should render the themes correctly", () => {
    test("it renders the success theme", () => {
      const wrapper = mount(NovaInputText, {
        props: { ...props, theme: "success" },
      });

      expect(wrapper.find(selectors.container).attributes().theme).toBe("success");
    });

    test("it renders the error theme", () => {
      const wrapper = mount(NovaInputText, {
        props: { ...props, theme: "error" },
      });

      expect(wrapper.find(selectors.container).attributes().theme).toBe("error");
    });

    test("if it has an error it forces the error theme", () => {
      const wrapper = mount(NovaInputText, {
        props: { ...props, theme: "success", error: "Uh oh!" },
      });

      expect(wrapper.find(selectors.container).attributes().theme).toBe("error");
    });
  });

  describe("if is readonly", () => {
    test("it should show the value as text", () => {
      const wrapper = mount(NovaInputText, {
        props: { ...props, readonly: true },
      });

      expect(wrapper.find(selectors.input).exists()).toBe(false);
      expect(wrapper.html().includes(props.modelValue)).toBeTruthy();
    });

    test("it should show the correct placeholder", () => {
      const wrapper = mount(NovaInputText, {
        props: { ...props, readonly: true, readonlyPlaceholder: "readonly placeholder", modelValue: "" },
      });

      expect(wrapper.find(selectors.input).exists()).toBe(false);
      expect(wrapper.html().includes("readonly placeholder")).toBeTruthy();
    });

    test("it can render a slot content", () => {
      const wrapper = mount(NovaInputText, {
        props: { ...props, readonly: true },
        slots: {
          default: "Main Content",
        },
      });
      expect(wrapper.find(".InputText__readonly").text()).toContain("Main Content");
    });
  });

  describe("text metrics", () => {
    test("it should not display the text metrics when showMetrics prop is not given", () => {
      const wrapper = mount(NovaInputText, { props });

      expect(wrapper.findComponent({ name: "NovaTextMetrics" }).exists()).toBe(false);
    });

    test("it should not display the text metrics when showMetrics prop is false", () => {
      const wrapper = mount(NovaInputText, { props: { ...props, showMetrics: false } });

      expect(wrapper.findComponent({ name: "NovaTextMetrics" }).exists()).toBe(false);
    });

    test("it should display the correct text metrics when showMetrics prop is true", () => {
      const wrapper = mount(NovaInputText, { props: { ...props, modelValue: "a few words", showMetrics: true } });

      const novaTextMetrics = wrapper.findComponent({ name: "NovaTextMetrics" });

      expect(novaTextMetrics.exists()).toBe(true);
      expect(novaTextMetrics.props()).toMatchObject(
        expect.objectContaining({
          wordsCount: 3,
          charactersCount: 11,
        })
      );
    });

    test("it should pass the inputProps.maxlength to the text metrics component if defined", () => {
      const wrapper = mount(NovaInputText, {
        props: { ...props, modelValue: "a few words", showMetrics: true, inputProps: { maxlength: 20 } },
      });

      const novaTextMetrics = wrapper.findComponent({ name: "NovaTextMetrics" });

      expect(novaTextMetrics.exists()).toBe(true);
      expect(novaTextMetrics.props()).toMatchObject(
        expect.objectContaining({
          maxCharacters: 20,
        })
      );
    });
  });
});

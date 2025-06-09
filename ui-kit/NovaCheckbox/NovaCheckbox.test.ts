import { mount, shallowMount } from "@vue/test-utils";
import { test, expect, describe, it } from "vitest";
import NovaCheckbox from "./NovaCheckbox.vue";

const selectors = {
  checkboxWrapper: "[data-testid='nova-checkbox-container']",
  label: "[data-testid='nova-checkbox-label']",
  checkbox: "#checkbox-checkbox-value",
  checkSvg: "[data-testid='nova-checkbox-check']",
  minusSvg: "[data-testid='nova-checkbox-minus']",
};

describe("NovaCheckbox", () => {
  it("it should mount and render correctly", () => {
    const wrapper = shallowMount(NovaCheckbox, {
      props: {
        size: "sm",
        disabled: false,
        label: null,
        description: null,
        status: "checked",
        value: "checkbox-value",
      },
    });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.checkboxWrapper).exists()).toBe(true);
    expect(wrapper.find(selectors.checkboxWrapper).attributes().size).toContain("sm");
    expect(wrapper.find(selectors.label).exists()).toBeFalsy();
    expect(wrapper.find(selectors.checkbox).attributes().disabled).toBe(undefined);

    expect(wrapper.find(selectors.checkSvg).exists()).toBeTruthy();
    expect(wrapper.find(selectors.minusSvg).exists()).toBeFalsy();
  });

  describe("when the disabled prop is set to true", () => {
    test("the input should not be clickable", async () => {
      const wrapper = mount(NovaCheckbox, {
        props: {
          size: "sm",
          disabled: true,
          label: null,
          description: null,
          status: "unchecked",
          value: "checkbox-value",
        },
      });

      const input = wrapper.find(selectors.checkbox);
      await input.trigger("input");

      const events = wrapper.emitted<Event[]>().input;
      expect(events).toBeFalsy();
      expect(wrapper.find(selectors.checkbox).attributes().disabled).toBe("");
    });
  });

  describe("when the checkbox is clicked", () => {
    test("it should emit an event", async () => {
      const wrapper = shallowMount(NovaCheckbox, {
        props: {
          size: "lg",
          label: "label-text",
          value: "checkbox-value",
          status: "checked",
        },
      });

      await wrapper.find(selectors.checkbox).trigger("click");
      const events = wrapper.emitted<Event[]>()["update:status"];
      expect(events).toBeTruthy();
      expect(events[0][0]).toBe("checkbox-value");
    });
  });

  describe("when the checkbox status is indeterminate", () => {
    test("it should show the minus image", () => {
      const wrapper = shallowMount(NovaCheckbox, {
        props: {
          size: "lg",
          label: "label-text",
          value: "checkbox-value",
          status: "indeterminate",
        },
      });

      expect(wrapper.find(selectors.minusSvg).exists()).toBeTruthy();
      expect(wrapper.find(selectors.checkSvg).exists()).toBeFalsy();
      expect(wrapper.find(selectors.label).exists()).toBeTruthy();
    });
  });

  describe("when the size props is lg", () => {
    test("it should have lg class", () => {
      const wrapper = shallowMount(NovaCheckbox, {
        props: {
          size: "lg",
          label: "label-text",
          value: "checkbox-value",
          status: "checked",
        },
      });

      expect(wrapper.find(selectors.checkboxWrapper).attributes().size).toContain("lg");
    });
  });
});

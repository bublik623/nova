import { mount } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import NovaButtonToggle from "./NovaButtonToggle.vue";

const selectors = {
  firstOption: "[data-testid='nova-button-toggle-first-option']",
  secondOption: "[data-testid='nova-button-toggle-second-option']",
  backgroundSlot: ".SlotBackground",
};

const slots = {
  firstOption: "Option One",
  secondOption: "Option Two",
};

describe("NovaButtonToggle", () => {
  test("it should mount and render correctly", () => {
    const wrapper = mount(NovaButtonToggle, {
      props: {
        modelValue: true,
      },
      slots,
    });

    expect(wrapper).toBeTruthy();
    expect(wrapper.attributes()["aria-checked"]).toBe("true");
    expect(wrapper.find(selectors.firstOption).text()).toBe(slots.firstOption);
    expect(wrapper.find(selectors.secondOption).text()).toBe(slots.secondOption);
    expect(wrapper.find(selectors.backgroundSlot).isVisible()).toBe(true);
  });

  describe("when checked is set to false", () => {
    test("it should set the correct aria attribute", () => {
      const wrapper = mount(NovaButtonToggle, {
        props: {
          modelValue: false,
        },
        slots,
      });

      expect(wrapper.attributes()["aria-checked"]).toBe("false");
    });
  });

  describe("when the user clicks the toggle", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(NovaButtonToggle, {
        props: {
          modelValue: true,
        },
        slots,
      });

      await wrapper.trigger("click");
      const events = wrapper.emitted<Event[]>()["update:modelValue"];

      expect(events).toBeTruthy();
      expect(events.length).toBe(1);
    });
  });
});

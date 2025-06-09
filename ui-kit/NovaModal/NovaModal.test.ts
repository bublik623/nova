import { mount } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import NovaModal, { Props } from "./NovaModal.vue";

const slots = {
  default: "Hello World!",
};

const props: Props = {
  show: true,
};

const selectors = {
  overlay: "[data-testid='modal-overlay']",
  modal: "[data-testid='modal']",
};

describe("NovaModal", () => {
  test("it should mount and render correctly", () => {
    const wrapper = mount(NovaModal, { props, slots });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.overlay).exists()).toBe(true);
    expect(wrapper.find(selectors.overlay).exists()).toBe(true);
    expect(wrapper.find(selectors.modal).exists()).toBe(true);
    expect(wrapper.find(selectors.modal).text()).toContain(slots.default);
  });

  describe("If the user click on the close btn", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(NovaModal, { props, slots });

      const overlay = wrapper.find(selectors.overlay);
      await overlay.trigger("click");

      const events = wrapper.emitted<Event[]>()["click:on-overlay"];
      expect(events).toBeTruthy();
      expect(events.length).toBe(1);
    });
  });
});

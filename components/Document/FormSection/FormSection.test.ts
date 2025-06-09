import { config, mount } from "@vue/test-utils";
import { vi, test, expect, describe } from "vitest";
import FormSection, { Props } from "./FormSection.vue";

config.global.mocks = {
  $t: (text: string) => text,
};

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const props: Props = {
  id: "test_id",
};

const selectors = {
  title: "[data-testid='field-heading-title']",
  description: "[data-testid='field-heading-description']",
  example: "[data-testid='form-example']",
  slotContainer: "[data-testid='form-slot-container']",
};

describe("FormSection", () => {
  test("it should mount and render correctly", () => {
    const wrapper = mount(FormSection, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.slotContainer).exists()).toBe(true);
    expect(wrapper.find(selectors.title).text()).toBe("experience.test_id.title");
    expect(wrapper.find(selectors.description).text()).toBe("experience.test_id.description");
    expect(wrapper.find(selectors.example).exists()).toBe(false);
  });

  describe("when some examples are passed as prop", () => {
    test("it should display them", () => {
      const examples = ["example 1", "example 2"];
      const wrapper = mount(FormSection, { props: { ...props, examples } });

      expect(wrapper.find(selectors.example).exists()).toBe(true);
      expect(wrapper.findAll(selectors.example).length).toBe(2);
    });
  });

  describe("when a maximum width for the slot is passed as prop", () => {
    test("it should apply it to the slot container", () => {
      const wrapper = mount(FormSection, {
        props: { ...props, slotMaxWidth: 100 },
      });

      expect(wrapper.find(selectors.slotContainer).attributes().style).toBe("max-width: 100px;");
    });
  });
});

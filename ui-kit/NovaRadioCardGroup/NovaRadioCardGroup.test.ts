import { mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import NovaRadioCardGroup, { Props } from "./NovaRadioCardGroup.vue";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const props: Props = {
  readonly: false,
  disabled: false,
  modelValue: "option1",
  options: [
    { title: "Option 1", value: "option1", description: "Description 1" },
    { title: "Option 2", value: "option2", description: "Description 2" },
    { title: "Option 3", value: "option3", description: "Description 3" },
  ],
};

describe("NovaRadioCardGroup", () => {
  test("It should render correctly", async () => {
    const wrapper = mount(NovaRadioCardGroup, { props });

    expect(wrapper.findAllComponents({ name: "NovaRadioCard" }).length).toBe(3);
  });

  test("selects correct radio card based on modelValue", async () => {
    const wrapper = mount(NovaRadioCardGroup, { props });
    const radioCards = wrapper.findAllComponents({ name: "NovaRadioCard" });
    expect(radioCards[0].attributes("checked")).toBeTruthy();
    expect(radioCards[1].attributes("checked")).toBeFalsy();
    expect(radioCards[2].attributes("checked")).toBeFalsy();
  });

  describe("if the readonly prop is true", () => {
    test("if the modelValue is not empty it should show the readonly text", async () => {
      const wrapper = mount(NovaRadioCardGroup, {
        props: {
          ...props,
          readonly: true,
        },
      });
      expect(wrapper.findAllComponents({ name: "NovaRadioCard" }).length).toBe(0);
      const paragraph = wrapper.findAll("p");
      expect(paragraph[0].text()).toBe(props.options[0].title);
      expect(paragraph[1].text()).toBe(props.options[0].description);
    });

    test("if the modelValue is empty it should show the no content util", async () => {
      const wrapper = mount(NovaRadioCardGroup, {
        props: {
          ...props,
          readonly: true,
          modelValue: undefined,
        },
      });
      expect(wrapper.findComponent({ name: "NoContentUtil" }).isVisible()).toBeTruthy();
    });
  });
});

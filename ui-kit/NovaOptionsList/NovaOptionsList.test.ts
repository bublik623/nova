import { config, mount, shallowMount } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import NovaOptionsList, { Props } from "./NovaOptionsList.vue";
import { BaseOption } from "@/types/Option";

config.global.mocks = {
  $t: (text: string) => text,
};

const props: Props<BaseOption<string>> = {
  options: getOptions(),
  selected: [{ label: "Option 3", value: "option_3" }],
  readonly: false,
};

const selectors = {
  optionsList: "ul[data-testid='options-list-list']",
  options: "[data-testid^='options-list-list-item-']",
  checkbox: "nova-checkbox-stub",
  selectedCount: "span[data-testid='options-list-selected']",
  clearAllBtn: "button[data-testid='options-list-clear-button']",
};

describe("NovaDropdown", () => {
  test("it should mount and render correctly", () => {
    const wrapper = mount(NovaOptionsList, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.optionsList).exists()).toBe(true);
    expect(wrapper.findAll(selectors.options).length).toBe(6);
    expect(wrapper.findAll(selectors.options)[2].attributes().selected).toBeTruthy();
  });

  test("it should display a default slot", () => {
    const wrapper = mount(NovaOptionsList, {
      props,
      slots: {
        default: "My default slot!",
      },
    });

    expect(wrapper.text()).toContain("My default slot!");
  });

  describe("when one of the option is clicked", () => {
    test("it should emit an event when the option is enabled", async () => {
      const wrapper = mount(NovaOptionsList, { props });

      await wrapper.findAll(selectors.options)[1].trigger("click");

      const events = wrapper.emitted<Event[]>()["select:option"];
      expect(events[0][0]).toEqual(props.options[1]);
    });

    test("it should not emit an event when the option is disabled", async () => {
      const options = getOptions();
      options[1].disabled = true;
      const wrapper = mount(NovaOptionsList, { props: { ...props, options } });

      await wrapper.findAll(selectors.options)[1].trigger("click");

      const events = wrapper.emitted<Event[]>()["select:option"];
      expect(events).toBeUndefined();
    });
  });

  describe("when one of the option is selected with the keyboard", () => {
    test("it should emit an event when the option is enabled", async () => {
      const wrapper = mount(NovaOptionsList, { props });

      await wrapper.findAll(selectors.options)[2].trigger("keydown.enter");

      let events = wrapper.emitted<Event[]>()["select:option"];
      expect(events[0][0]).toEqual(props.options[2]);

      await wrapper.findAll(selectors.options)[3].trigger("keydown.space");

      events = wrapper.emitted<Event[]>()["select:option"];
      expect(events[1][0]).toEqual(props.options[3]);
    });

    test("it should not emit an event when the option is disabled", async () => {
      const options = getOptions();
      options[2].disabled = true;
      options[3].disabled = true;
      const wrapper = mount(NovaOptionsList, { props: { ...props, options } });

      await wrapper.findAll(selectors.options)[2].trigger("keydown.enter");

      let events = wrapper.emitted<Event[]>()["select:option"];
      expect(events).toBeUndefined();

      await wrapper.findAll(selectors.options)[3].trigger("keydown.space");

      events = wrapper.emitted<Event[]>()["select:option"];
      expect(events).toBeUndefined();
    });
  });

  describe("when the user press the esc key", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(NovaOptionsList, { props });

      await wrapper.findAll(selectors.options)[1].trigger("keydown.esc");

      expect(wrapper.emitted<Event[]>()["keydown:esc"]).toBeTruthy();
    });
  });

  describe("multi select", () => {
    const propsWithMulti = { ...props, multi: true };

    describe("when one of the options is selected", () => {
      test("the checkbox should be checked", () => {
        const wrapper = shallowMount(NovaOptionsList, { props: propsWithMulti });

        expect(wrapper.findAll(selectors.checkbox)[2].attributes().status).toBe("checked");
      });
    });

    describe("when multiple options are checked", () => {
      test("it should display the correct selected count in the header", () => {
        const selected = [propsWithMulti.options[0], propsWithMulti.options[1], propsWithMulti.options[2]];
        const wrapper = shallowMount(NovaOptionsList, {
          props: { ...propsWithMulti, selected },
        });

        expect(wrapper.find(selectors.selectedCount).text()).toContain("3");
      });
    });

    describe("when the user clicks on the 'clear all' button", () => {
      test("it should emit an event", async () => {
        const wrapper = mount(NovaOptionsList, {
          props: propsWithMulti,
        });

        await wrapper.find(selectors.clearAllBtn).trigger("click");

        const events = wrapper.emitted<Event[]>()["click:clear"];
        expect(events).toBeTruthy();
      });
    });

    describe("multi select does not support disabled options", () => {
      describe("when one of the option is clicked", () => {
        test("it should emit an event even if the option is disabled", async () => {
          const options = getOptions();
          options[1].disabled = true;
          const wrapper = mount(NovaOptionsList, { props: { ...propsWithMulti, options } });

          await wrapper.findAll(selectors.options)[1].trigger("click");

          const events = wrapper.emitted<Event[]>()["select:option"];
          expect(events[0][0]).toStrictEqual(options[1]);
        });
      });

      describe("when one of the option is selected with the keyboard", () => {
        test("it should emit an event even if the option is disabled", async () => {
          const options = getOptions();
          options[2].disabled = true;
          options[3].disabled = true;
          const wrapper = mount(NovaOptionsList, { props: { ...propsWithMulti, options } });

          await wrapper.findAll(selectors.options)[2].trigger("keydown.enter");

          let events = wrapper.emitted<Event[]>()["select:option"];
          expect(events[0][0]).toStrictEqual(options[2]);

          await wrapper.findAll(selectors.options)[3].trigger("keydown.space");

          events = wrapper.emitted<Event[]>()["select:option"];
          expect(events[1][0]).toStrictEqual(options[3]);
        });
      });
    });
  });

  describe("if the readonly prop is true", () => {
    test("it should not emit any event", async () => {
      const wrapper = mount(NovaOptionsList, { props: { ...props, readonly: true } });

      await wrapper.findAll(selectors.options)[0].trigger("click");
      const events = wrapper.emitted<Event[]>()["select:option"];
      expect(events).toBeFalsy();
    });

    test("it should not display the clear all button", () => {
      const wrapper = mount(NovaOptionsList, { props: { ...props, readonly: true } });

      expect(wrapper.find(selectors.clearAllBtn).exists()).toBeFalsy();
    });

    test("it should only show the selected items", () => {
      const wrapper = mount(NovaOptionsList, { props: { ...props, readonly: true } });

      expect(wrapper.findAll(selectors.options).length).toBe(1);
      expect(wrapper.findAll(selectors.options)[0].text()).toContain(props.selected![0].label);
    });
  });
});

function getOptions(): Array<BaseOption<string>> {
  return [
    { label: "Option 1", value: "option_1" },
    { label: "Option 2", value: "option_2" },
    { label: "Option 3", value: "option_3" },
    { label: "Option 4", value: "option_4" },
    { label: "Option 5", value: "option_5" },
    { label: "Option 6", value: "option_6" },
  ];
}

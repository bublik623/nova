import { config, mount } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import NovaDropdown, { Props } from "./NovaDropdown.vue";
import { cloneDeep } from "lodash";
import { BaseOption } from "@/types/Option";

config.global.mocks = {
  $t: (text: string) => text,
};

const props: Props<BaseOption<string>> = {
  options: [
    { label: "Option 1", value: "option_1" },
    { label: "Option 2", value: "option_2" },
    { label: "Option 3", value: "option_3" },
    { label: "Option 4", value: "option_4" },
    { label: "Option 5", value: "option_5" },
    { label: "Option 6", value: "option_6" },
  ],
  selected: [{ label: "Option 3", value: "option_3" }],
  show: true,
};

const selectors = {
  optionsList: "ul[data-testid='options-list-list']",
  options: "[data-testid^='options-list-list-item-']",
  checkbox: "nova-checkbox-stub",
  selectedCount: "span[data-testid='options-list-selected']",
  clearAllBtn: "button[data-testid='options-list-clear-button']",
  spinner: "[data-testid='nova-spinner']",
};

describe("NovaDropdown", () => {
  test("it should mount and render correctly", () => {
    const wrapper = mount(NovaDropdown, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.optionsList).exists()).toBe(true);
    expect(wrapper.findAll(selectors.options).length).toBe(6);
    expect(wrapper.findAll(selectors.options)[2].attributes().selected).toBeTruthy();
  });

  test("it should display a default slot", () => {
    const wrapper = mount(NovaDropdown, {
      props,
      slots: {
        default: "My default slot!",
      },
    });

    expect(wrapper.text()).toContain("My default slot!");
  });

  describe("when it's loading", () => {
    test("it should show a spinner", () => {
      const wrapper = mount(NovaDropdown, {
        props: { ...props, loading: true },
      });

      expect(wrapper.find(selectors.optionsList).exists()).toBe(false);
      expect(wrapper.find(selectors.spinner).isVisible()).toBe(true);
    });
  });

  describe("when the show prop is set to false", () => {
    test("it should not display the options", () => {
      const wrapper = mount(NovaDropdown, { props: { ...props, show: false } });

      expect(wrapper).toBeTruthy();
      expect(wrapper.find(selectors.optionsList).exists()).toBe(false);
      expect(wrapper.find(selectors.options).exists()).toBe(false);
    });
  });

  describe("when one of the option is clicked", () => {
    test("it should emit an event when the option is enabled", async () => {
      const wrapper = mount(NovaDropdown, { props });

      await wrapper.findAll(selectors.options)[1].trigger("click");

      const events = wrapper.emitted<Event[]>()["select:option"];
      expect(events[0][0]).toEqual(props.options[1]);
    });

    test("it should not emit an event when the option is disabled", async () => {
      const options = props.options.map(cloneDeep);
      options[1].disabled = true;

      const wrapper = mount(NovaDropdown, { props: { ...props, options } });

      await wrapper.findAll(selectors.options)[1].trigger("click");

      const events = wrapper.emitted<Event[]>()["select:option"];
      expect(events).toBeUndefined();
    });
  });

  describe("when one of the option is selected with the keyboard", () => {
    test("it should emit an event when the option is enabled", async () => {
      const wrapper = mount(NovaDropdown, { props });

      await wrapper.findAll(selectors.options)[2].trigger("keydown.enter");

      let events = wrapper.emitted<Event[]>()["select:option"];
      expect(events[0][0]).toEqual(props.options[2]);

      await wrapper.findAll(selectors.options)[3].trigger("keydown.space");

      events = wrapper.emitted<Event[]>()["select:option"];
      expect(events[1][0]).toEqual(props.options[3]);
    });

    test("it should not emit an event when the option is disabled", async () => {
      const options = props.options.map(cloneDeep);
      options[2].disabled = true;
      options[3].disabled = true;

      const wrapper = mount(NovaDropdown, { props: { ...props, options } });

      await wrapper.findAll(selectors.options)[2].trigger("keydown.enter");

      let events = wrapper.emitted<Event[]>()["select:option"];
      expect(events).toBeUndefined();

      await wrapper.findAll(selectors.options)[3].trigger("keydown.enter");

      events = wrapper.emitted<Event[]>()["select:option"];
      expect(events).toBeUndefined();
    });
  });

  describe("when the user press the esc key", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(NovaDropdown, { props });

      await wrapper.findAll(selectors.options)[1].trigger("keydown.esc");

      expect(wrapper.emitted<Event[]>()["keydown:esc"]).toBeTruthy();
    });
  });

  describe("'empty' slot", () => {
    test("it should not show it if there are options", () => {
      const wrapper = mount(NovaDropdown, {
        props,
        slots: {
          empty: "Empty slot",
        },
      });
      expect(wrapper.text()).not.include("Empty slot");
    });

    test("it should show it if there are no options", () => {
      const wrapper = mount(NovaDropdown, {
        props: { ...props, options: [] },
        slots: {
          empty: "Empty slot",
        },
      });
      expect(wrapper.text()).include("Empty slot");
    });
  });

  describe("Showing searchbar", () => {
    test("the searchbar should be visible", () => {
      const wrapper = mount(NovaDropdown, {
        props: { ...props, showSearchbar: true },
        slots: {
          empty: "Empty slot",
        },
      });

      expect(wrapper.find("#dropdown-searchbar").exists).toBeTruthy();
    });

    test("If the user type it should emit an event", async () => {
      const wrapper = mount(NovaDropdown, {
        props: { ...props, showSearchbar: true },
        slots: {
          empty: "Empty slot",
        },
      });

      const searchbar = wrapper.find("#dropdown-searchbar");

      expect(searchbar.exists).toBeTruthy();
      await searchbar.setValue("newValue");

      expect(wrapper.emitted<Event[]>()["update:searchQuery"]).toBeTruthy();
    });
  });
});

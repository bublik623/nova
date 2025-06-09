import { config, flushPromises, mount } from "@vue/test-utils";
import { test, expect, describe } from "vitest";
import NovaSelectSearch, { Props } from "./NovaSelectSearch.vue";
import { BaseOption } from "@/types/Option";

config.global.mocks = {
  $t: (text: string) => text,
};

const props: Props<string> = {
  id: "test-id",
  options: getOptions(),
};

const selectors = {
  optionsList: "ul[data-testid='options-list-list']",
  options: "[data-testid^='options-list-list-item-']",
  textInput: "[data-testid='select-search-input']",
  dropdownList: "[data-testid='options-list-list']",
  dropdownItem: "[data-testid^='options-list-list-item-']",
  errorMessage: "span[data-testid='select-search-error']",
  checkbox: "input[type='checkbox']",
  clearAllBtn: "button[data-testid='options-list-clear-button']",
};

describe("NovaSelectSearch", () => {
  test("it should mount and render correctly", () => {
    const wrapper = mount(NovaSelectSearch, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.textInput).exists()).toBe(true);
    expect(wrapper.find(selectors.dropdownList).exists()).toBe(false);
  });

  describe("when the 'multi' prop is set to true", () => {
    test("it should render a multiselect dropdown", async () => {
      const wrapper = mount(NovaSelectSearch, {
        props: { ...props, multi: true },
      });

      await wrapper.find(selectors.textInput).trigger("click");

      expect(wrapper.find(selectors.checkbox).exists()).toBe(true);
      expect(wrapper.findAll(selectors.checkbox).length).toBe(props.options.length);
    });

    describe("when the user selects a disabled option", () => {
      test("it should emit select:option event", async () => {
        const options = [{ label: "Option disabled", value: "option_disabled", disabled: true }, ...props.options];
        const wrapper = mount(NovaSelectSearch, {
          props: { ...props, options, multi: true },
        });

        await wrapper.find(selectors.textInput).trigger("click");
        await wrapper.findAll(selectors.dropdownItem)[0].trigger("click");

        const events = wrapper.emitted<Event[]>()["select:option"];
        expect(events[0][0]).toStrictEqual(options[0]);
      });
    });
  });

  describe("when the user clicks on the input", () => {
    test("it should open the dropdown", async () => {
      const wrapper = mount(NovaSelectSearch, { props });

      await wrapper.find(selectors.textInput).trigger("click");

      expect(wrapper.find(selectors.dropdownList).exists()).toBe(true);
      expect(wrapper.findAll(selectors.dropdownItem).length).toBe(6);
    });
  });

  describe("when the user inputs some text", () => {
    test("it should open the dropdown", async () => {
      const wrapper = mount(NovaSelectSearch, { props });

      const input = wrapper.find(selectors.textInput);
      await input.trigger("input");

      expect(wrapper.find(selectors.dropdownList).exists()).toBe(true);
      expect(wrapper.findAll(selectors.dropdownItem).length).toBe(6);
    });

    test("it should emit en event", async () => {
      const wrapper = mount(NovaSelectSearch, { props });

      const input = wrapper.find(selectors.textInput);
      await input.setValue("newValue");

      const events = wrapper.emitted<Event[]>()["update:searchQuery"];
      expect(events[0][0]).toBe("newValue");
    });
  });

  describe("when the user selects an option", () => {
    test("it should emit an event when the option is enabled", async () => {
      const wrapper = mount(NovaSelectSearch, { props });

      await wrapper.find(selectors.textInput).trigger("click");
      await wrapper.findAll(selectors.dropdownItem)[2].trigger("click");

      const events = wrapper.emitted<Event[]>()["select:option"];
      expect(events[0][0]).toStrictEqual(props.options[2]);
    });

    test("it should not emit an event when the option is disabled", async () => {
      const options = getOptions();
      options[2].disabled = true;
      const wrapper = mount(NovaSelectSearch, { props: { ...props, options } });

      await wrapper.find(selectors.textInput).trigger("click");
      await wrapper.findAll(selectors.dropdownItem)[2].trigger("click");

      const events = wrapper.emitted<Event[]>()["select:option"];
      expect(events).toBeUndefined();
    });

    test("it should close the dropdown when the option is enabled", async () => {
      const wrapper = mount(NovaSelectSearch, { props });

      await wrapper.find(selectors.textInput).trigger("click");
      expect(wrapper.find(selectors.dropdownList).exists()).toBe(true);

      await wrapper.findAll(selectors.dropdownItem)[2].trigger("click");
      expect(wrapper.find(selectors.dropdownList).exists()).toBe(false);
    });

    test("it should not close the dropdown when the option is enabled", async () => {
      const options = getOptions();
      options[2].disabled = true;
      const wrapper = mount(NovaSelectSearch, { props: { ...props, options } });

      await wrapper.find(selectors.textInput).trigger("click");
      expect(wrapper.find(selectors.dropdownList).exists()).toBe(true);

      await wrapper.findAll(selectors.dropdownItem)[2].trigger("click");
      expect(wrapper.find(selectors.dropdownList).exists()).toBe(true);
    });
  });

  describe("when the user selects multiple options", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(NovaSelectSearch, {
        props: { ...props, multi: true },
      });

      await wrapper.find(selectors.textInput).trigger("click");
      await wrapper.findAll(selectors.dropdownItem)[2].trigger("click");
      await wrapper.findAll(selectors.dropdownItem)[3].trigger("click");
      await wrapper.findAll(selectors.dropdownItem)[3].trigger("click");

      const events = wrapper.emitted<Event[]>()["select:option"];
      expect(events[0][0]).toStrictEqual(props.options[2]);
      expect(events[1][0]).toStrictEqual(props.options[3]);
      expect(events[1][0]).toStrictEqual(props.options[3]);
    });

    test("it should not close the dropdown", async () => {
      const wrapper = mount(NovaSelectSearch, {
        props: { ...props, multi: true },
      });

      await wrapper.find(selectors.textInput).trigger("click");
      expect(wrapper.find(selectors.dropdownList).exists()).toBe(true);

      await wrapper.findAll(selectors.dropdownItem)[2].trigger("click");
      expect(wrapper.find(selectors.dropdownList).exists()).toBe(true);

      await wrapper.findAll(selectors.dropdownItem)[4].trigger("click");
      expect(wrapper.find(selectors.dropdownList).exists()).toBe(true);
    });
  });

  describe("when the user clicks on 'clear all' button", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(NovaSelectSearch, {
        props: { ...props, multi: true },
      });

      await wrapper.find(selectors.textInput).trigger("click");
      await wrapper.find(selectors.clearAllBtn).trigger("click");

      const events = wrapper.emitted<Event[]>()["clear:options"];
      expect(events).toBeTruthy();
    });
  });

  describe("when the placeholder is passed as prop", () => {
    test("it should display it in the input", () => {
      const wrapper = mount(NovaSelectSearch, {
        props: {
          ...props,
          inputValue: undefined,
          placeholder: "test placeholder",
        },
      });

      expect(wrapper.find(selectors.textInput).attributes().placeholder).toBe("test placeholder");
    });
  });

  describe("when the disabled prop is set to true", () => {
    test("it should disable the input", async () => {
      const wrapper = mount(NovaSelectSearch, {
        props: {
          ...props,
          disabled: true,
        },
      });

      const input = wrapper.find(selectors.textInput);
      await input.setValue("newValue");

      expect(wrapper.emitted<Event[]>()["update:inputValue"]).toBeFalsy();
      expect(wrapper.find(selectors.textInput).attributes().disabled).toBe("");
    });
  });

  describe("when an error is passed as prop", () => {
    test("it should render the error message", () => {
      const wrapper = mount(NovaSelectSearch, {
        props: {
          ...props,
          error: "test error",
        },
      });

      expect(wrapper.find(selectors.errorMessage).exists()).toBe(true);
      expect(wrapper.find(selectors.errorMessage).text()).toBe("test error");
    });
  });

  describe("when selected is passed as prop and it's not in multi mode", () => {
    test("it should display the selected option label when the dropdown is closed", () => {
      const wrapper = mount(NovaSelectSearch, {
        props: {
          ...props,
          selected: [props.options[1]],
        },
      });

      expect((wrapper.find(selectors.textInput).element as HTMLInputElement).value).toBe(props.options[1].label);
    });
  });

  describe("when the user clicks outside of the component", () => {
    test("it should close the dropdown", async () => {
      const wrapper = mount(NovaSelectSearch, {
        props,
      });

      expect(wrapper.find(selectors.dropdownList).exists()).toBe(false);
      await wrapper.find(selectors.textInput).trigger("click");
      expect(wrapper.find(selectors.dropdownList).exists()).toBe(true);

      global.dispatchEvent(new Event("click"));

      await flushPromises();

      expect(wrapper.find(selectors.dropdownList).exists()).toBe(false);
    });
  });

  describe("options rendering", () => {
    test("it should render options just as text with this format: `${option.label}` when a template is not provided", async () => {
      const wrapper = mount(NovaSelectSearch, { props });

      await wrapper.find(selectors.textInput).trigger("click");

      expect(wrapper.find(selectors.dropdownList).exists()).toBe(true);
      const listItems = wrapper.findAll(selectors.dropdownItem);

      expect(listItems).toBeDefined();
      expect(listItems.length).toBe(props.options.length);
      listItems.forEach((listItem) => {
        expect(props.options.map((option) => option.label)).toContain(listItem.text());
        expect(listItem.element.childElementCount).toBe(0);
      });
    });

    test("it should render options with the provided template", async () => {
      const wrapper = mount(NovaSelectSearch, {
        props,
        slots: {
          default: "<span>{{ option.label }}</span>",
        },
      });

      await wrapper.find(selectors.textInput).trigger("click");

      expect(wrapper.find(selectors.dropdownList).exists()).toBe(true);
      const listItems = wrapper.findAll(selectors.dropdownItem);

      expect(listItems).toBeDefined();
      expect(listItems.length).toBe(props.options.length);
      listItems.forEach((listItem) => {
        expect(listItem.element.childElementCount).toBe(1);
        const listItemSpan = listItem.find("span");
        expect(listItemSpan).toBeDefined();
        expect(props.options.map((option) => option.label)).toContain(listItemSpan.text());
      });
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

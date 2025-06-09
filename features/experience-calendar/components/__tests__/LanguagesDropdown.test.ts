import { describe, test, expect, vi, beforeEach } from "vitest";
import { mount, config } from "@vue/test-utils";
import LanguagesDropdown, { Props } from "../LanguagesDropdown.vue";
import { AvailableLanguage } from "@/types/Language";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

config.global.mocks = {
  $t: (text: string) => text,
};

const masterDataMock: { availableLanguages: AvailableLanguage[] } = {
  availableLanguages: ["en", "es", "it", "de", "fr", "nl", "pl", "pt", "ru", "dk", "no", "fi", "se"],
};

vi.mock("@/stores/master-data", () => ({
  useMasterData: () => masterDataMock,
}));

const props: Props = {
  modelValue: [],
  allowedLanguages: ["en", "es", "fr", "de"],
};

const selectors = {
  dropdownBtn: "[data-testid='languages-dropdown-button']",
  dropdownLabel: "#languages-dropdown-label",
  selectedCounter: "[data-testid='languages-dropdown-selected-counter']",
  clearBtn: "[data-testid='languages-dropdown-clear-btn']",
  dropdownItem: "[data-testid='languages-dropdown-item']",
  dropdownItemCheckbox: "[data-testid='nova-checkbox-label']",
  dropdownItemInputNumber: ".InputNumber",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("InputOption", () => {
  test("it should render correctly", () => {
    const wrapper = mount(LanguagesDropdown, { props });

    expect(wrapper).toBeTruthy();
    expect(wrapper.find(selectors.dropdownBtn)).toBeTruthy();
    expect(wrapper.find(selectors.dropdownBtn).attributes().invalid).toBe(undefined);
    expect(wrapper.find(selectors.dropdownLabel)).toBeTruthy();
    expect(wrapper.find(selectors.dropdownLabel).text()).toBe("languages.dropdown.placeholder");
  });

  describe("if you click on the button", () => {
    test("the list of languages should appear", async () => {
      const wrapper = mount(LanguagesDropdown, { props });

      await wrapper.find(selectors.dropdownBtn).trigger("click");
      expect(wrapper.findAll(selectors.dropdownItem).length).toBe(props.allowedLanguages.length);
    });
    test("if is disabled it should not appear", async () => {
      const wrapper = mount(LanguagesDropdown, {
        props: { ...props, disabled: true },
      });

      await wrapper.find(selectors.dropdownBtn).trigger("click");
      expect(wrapper.findAll(selectors.dropdownItem).length).toBe(0);
    });
  });

  describe("if you click on one item", () => {
    test("it should emit an event", async () => {
      const wrapper = mount(LanguagesDropdown, { props });

      await wrapper.find(selectors.dropdownBtn).trigger("click");
      await wrapper.findAll(selectors.dropdownItemCheckbox)[3].trigger("click");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events[0][0]).toEqual([{ language: "fr" }]);

      // check if the selected counter is working
      expect(wrapper.find(selectors.selectedCounter).text()).toBe("1 common.dropdown.header.selected");

      await wrapper.findAll(selectors.dropdownItemCheckbox)[2].trigger("click");
      expect(wrapper.find(selectors.selectedCounter).text()).toBe("2 common.dropdown.header.selected");
    });
  });

  describe("if the prop limitedCapacity is true", () => {
    test("it should show also the inputNumber in each item", async () => {
      const wrapper = mount(LanguagesDropdown, {
        props: { ...props, limitedCapacity: true },
      });

      await wrapper.find(selectors.dropdownBtn).trigger("click");
      expect(wrapper.findAll(selectors.dropdownItemInputNumber).length).toBe(props.allowedLanguages.length);

      // check if is enabled when the language is selected
      expect(wrapper.findAll(selectors.dropdownItemInputNumber)[0].attributes().disabled).not.toBe(undefined);

      await wrapper.setProps({
        modelValue: [{ language: "de", capacity: 20 }],
        limitedCapacity: true,
      });
      expect(wrapper.findAll(selectors.dropdownItemInputNumber)[0].attributes().disabled).toBe(undefined);
    });
  });

  describe("if the prop limitedCapacity is true", () => {
    test("it should emit an event with the capacity", async () => {
      const wrapper = mount(LanguagesDropdown, {
        props: { modelValue: [], allowedLanguages: props.allowedLanguages, limitedCapacity: true, type: "person" },
      });

      await wrapper.find(selectors.dropdownBtn).trigger("click");
      expect(wrapper.text()).include("language.dropdown.header.person");
      await wrapper.findAll(selectors.dropdownItemCheckbox)[1].trigger("click");

      const events = wrapper.emitted<Event[]>()["update:modelValue"];
      expect(events[0][0]).toEqual([{ language: "en", capacity: 0 }]);

      await wrapper.findAll(selectors.dropdownItemInputNumber)[1].setValue(15);
      expect(events[0][0]).toEqual([{ language: "en", capacity: 15 }]);
    });
  });

  describe("is it's invalid", () => {
    test("it should have a custom attribute", async () => {
      const wrapper = mount(LanguagesDropdown, {
        props: {
          ...props,
          limitedCapacity: true,
          validationErrors: { _errors: ["custom error"] },
          type: "group",
        },
      });

      expect(wrapper.find(selectors.dropdownBtn).attributes().invalid).toBe("true");

      await wrapper.find(selectors.dropdownBtn).trigger("click");
      expect(wrapper.text()).include("language.dropdown.header.group");
      await wrapper.findAll(selectors.dropdownItemCheckbox)[1].trigger("click");

      const capacityInput = wrapper.findAll(selectors.dropdownItemInputNumber)[1];
      expect(capacityInput.attributes()["data-invalid"]).toBe("true");

      await capacityInput.setValue(10);
      expect(capacityInput.attributes()["data-invalid"]).toBeUndefined();
    });
  });
});

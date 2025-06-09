import { describe, it, expect, beforeEach, vi } from "vitest";
import { shallowMount, type VueWrapper } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import { computed } from "vue";

import OptionsSection from "./OptionsSection.vue";
import { useLastSavedOptionsSectionData } from "./composables/useLastSavedOptionsSectionData";
import { useOptionsSectionSaveOperation } from "./composables/useOptionsSectionSaveOperation";
import type { OptionsSectionData, Option } from "./types";

vi.mock("./composables/useLastSavedOptionsSectionData", () => ({
  useLastSavedOptionsSectionData: vi.fn(),
}));

vi.mock("./composables/useOptionsSectionSaveOperation", () => ({
  useOptionsSectionSaveOperation: vi.fn(),
}));

const createSampleOption = (id: string, title: string, pax: string[] | "all"): Option => ({
  id: id,
  title: title,
  code: `C-${id}`,
  duration: Math.random() * 5,
  subchannels: "all",
  paxTypes: pax,
});
const createDefaultOptionsData = (): OptionsSectionData => ({ options: [] });

describe("OptionsSection.vue", () => {
  let wrapper: VueWrapper<any>;
  let mockWorkingCopyOptions: Option[];

  const experienceIdProp = "exp-test-123";

  const mountComponent = (initialStoreState: OptionsSectionData = { options: [] }) => {
    const piniaState = {
      "opinoia-options-section": {
        workingCopyData: { options: initialStoreState.options ?? [] },
      },
    };
    wrapper = shallowMount(OptionsSection, {
      props: { experienceId: experienceIdProp },
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, initialState: piniaState })],
        renderStubDefaultSlot: true,
      },
    });
  };

  beforeEach(() => {
    mockWorkingCopyOptions = [];
    const mockedLastSavedDataComposable = vi.mocked(useLastSavedOptionsSectionData);
    mockedLastSavedDataComposable.mockReset();
    mockedLastSavedDataComposable.mockImplementation(() => {
      return {
        isLoading: computed(() => false),
        data: computed(() => createDefaultOptionsData()),
      };
    });

    const mockedSaveOperationComposable = vi.mocked(useOptionsSectionSaveOperation);
    mockedSaveOperationComposable.mockReset();
    mockedSaveOperationComposable.mockImplementation(() => {
      return {
        isSaving: computed(() => false),
        save: vi.fn(),
      };
    });
  });

  describe("Given the component is mounted (with local renderStubDefaultSlot)", () => {
    it("Then it should render the FormSection stub and the OptionsTable stub (in the slot)", () => {
      mountComponent();
      const formSectionStub = wrapper.findComponent({ name: "FormSection" });
      const optionsTableStub = wrapper.findComponent({ name: "OptionsTable" });
      expect(formSectionStub.exists()).toBe(true);
      expect(optionsTableStub.exists()).toBe(true);
    });
  });

  describe("Given the store provides options data via createTestingPinia (with local renderStubDefaultSlot)", () => {
    beforeEach(() => {
      mockWorkingCopyOptions = [
        createSampleOption("opt-A", "Option A", ["ADT"]),
        createSampleOption("opt-B", "Option B", "all"),
      ];
      mountComponent({ options: mockWorkingCopyOptions });
    });

    it("Then OptionsTable stub should receive the correct experienceId prop", () => {
      const optionsTableStub = wrapper.findComponent({ name: "OptionsTable" });
      expect(optionsTableStub.exists()).toBe(true);
      expect(optionsTableStub.props("experienceId")).toBe(experienceIdProp);
    });

    it("Then OptionsTable stub should receive the correct options prop from the testing store state", () => {
      const optionsTableStub = wrapper.findComponent({ name: "OptionsTable" });
      expect(optionsTableStub.exists()).toBe(true);
      expect(optionsTableStub.props("options")).toEqual(mockWorkingCopyOptions);
    });

    it("Then OptionsTable stub should receive the hardcoded invalidOptionsId prop as an empty array", () => {
      const optionsTableStub = wrapper.findComponent({ name: "OptionsTable" });
      expect(optionsTableStub.exists()).toBe(true);
      expect(optionsTableStub.props("invalidOptionsId")).toEqual([]);
    });
  });

  describe("Given the store provides different options data initially via createTestingPinia (with local renderStubDefaultSlot)", () => {
    it("Then OptionsTable receives the corresponding options prop", () => {
      const differentOptions = [createSampleOption("opt-C", "Option C", [])];
      mountComponent({ options: differentOptions });
      const optionsTableStub = wrapper.findComponent({ name: "OptionsTable" });
      expect(optionsTableStub.exists()).toBe(true);
      expect(optionsTableStub.props("options")).toEqual(differentOptions);
    });
  });
});

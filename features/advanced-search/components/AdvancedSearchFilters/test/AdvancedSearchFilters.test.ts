import { config, shallowMount } from "@vue/test-utils";
import AdvancedSearchFilters from "@/features/advanced-search/components/AdvancedSearchFilters/AdvancedSearchFilters.vue";
import { describe, test, expect } from "vitest";
import { AdvancedFiltersConfig, AdvancedFiltersValues } from "@/features/advanced-search/types/filters";

config.global.mocks = {
  $t: (s: string) => s,
};

const dummyFilters: AdvancedFiltersConfig[] = [
  {
    key: "date-range-1",
    label: "Date Range 1",
    type: "date-range",
  },
  {
    key: "date-range-2",
    label: "Date Range 2",
    type: "date-range",
  },
  {
    key: "multi-select-1",
    label: "Multi Select 1",
    type: "multiselect",
    options: [],
  },
  {
    key: "multi-select-2",
    label: "Multi Select 2",
    type: "multiselect",
    options: [],
  },
];

const filters: AdvancedFiltersValues = {
  [dummyFilters[0].key]: {
    type: "date-range",
    value: {
      from: new Date(),
      to: new Date(),
    },
  },
  [dummyFilters[1].key]: {
    type: "date-range",
    value: {
      from: new Date(),
      to: new Date(),
    },
  },
  [dummyFilters[2].key]: {
    type: "multiselect",
    value: [{ value: "option-1", label: "Option 1" }],
  },
  [dummyFilters[3].key]: {
    type: "multiselect",
    value: [{ value: "option-2", label: "Option 2" }],
  },
};

const props: {
  mostUsedConfig: AdvancedFiltersConfig[];
  moreFiltersConfig: AdvancedFiltersConfig[];
  filtersValues: AdvancedFiltersValues;
  canClear: boolean;
  canApply: boolean;
} = {
  mostUsedConfig: dummyFilters,
  moreFiltersConfig: dummyFilters,
  filtersValues: filters,
  canClear: true,
  canApply: true,
};

describe("AdvancedSearchFilters", () => {
  test("it renders correctly when open", () => {
    const wrapper = shallowMount(AdvancedSearchFilters, {
      props,
    });

    expect(wrapper.find(".AdvancedSearchFilters.isClosed").exists()).toBe(false);
    expect(wrapper.find(".AdvancedSearchFilters.isOpen").exists()).toBe(true);
  });

  test("it renders correctly when closed", async () => {
    const wrapper = shallowMount(AdvancedSearchFilters, {
      props,
    });

    wrapper.vm.close = true;

    await nextTick();

    expect(wrapper.find(".AdvancedSearchFilters.isClosed").exists()).toBe(true);
    expect(wrapper.find(".AdvancedSearchFilters.isOpen").exists()).toBe(false);
  });

  test("it toggles close state when button is clicked", async () => {
    const wrapper = shallowMount(AdvancedSearchFilters, {
      props,
    });

    expect(wrapper.vm.close).toBe(false);

    await wrapper.findComponent({ name: "NovaButtonIcon" }).trigger("click");

    expect(wrapper.vm.close).toBe(true);

    await wrapper.findComponent({ name: "NovaButtonIcon" }).trigger("click");

    expect(wrapper.vm.close).toBe(false);
  });

  describe("clear button", () => {
    test("it emits on:clearAllFilters event when the clear button is clicked", async () => {
      const wrapper = shallowMount(AdvancedSearchFilters, {
        props,
      });

      expect(wrapper.emitted()["on:clearAllFilters"]).toBeUndefined();

      await wrapper.findComponent("[data-testid='advanced-search-clear-filters']")?.trigger("click");

      expect(wrapper.emitted()["on:clearAllFilters"].length).toEqual(1);
    });

    test("if canClear prop is false, then clear button should be disabled", async () => {
      const wrapper = shallowMount(AdvancedSearchFilters, { props: { ...props, canClear: true } });

      expect(wrapper.findAllComponents({ name: "NovaButton" })[0].attributes().disabled).toBe("false");

      await wrapper.setProps({ canClear: false });

      expect(wrapper.findAllComponents({ name: "NovaButton" })[0].attributes().disabled).toBe("true");
    });
  });

  describe("apply button", () => {
    test("it emits on:applyFilters when the apply button is clicked", async () => {
      const wrapper = shallowMount(AdvancedSearchFilters, {
        props: { ...props, modelValue: {}, selectedFilters: filters },
      });

      expect(wrapper.emitted()["on:applyFilters"]).toBeUndefined();

      await wrapper.findComponent("[data-testid='advanced-search-apply-filters']")?.trigger("click");

      expect(wrapper.emitted()["on:applyFilters"].length).toEqual(1);
    });

    test('if canApply prop is false, then the "apply filters" button should be disabled', async () => {
      const wrapper = shallowMount(AdvancedSearchFilters, { props: { ...props, canApply: true } });

      expect(wrapper.findAllComponents({ name: "NovaButton" })[1].attributes().disabled).toBe("false");

      await wrapper.setProps({ canApply: false });

      expect(wrapper.findAllComponents({ name: "NovaButton" })[1].attributes().disabled).toBe("true");
    });
  });

  test("it renders filters correctly", () => {
    const wrapper = shallowMount(AdvancedSearchFilters, {
      props,
    });

    expect(wrapper.findAllComponents({ name: "AdvancedSearchFilterSection" }).length).toBe(2);
  });

  test("if a section has no filters it does not render", () => {
    const wrapper = shallowMount(AdvancedSearchFilters, {
      props: {
        ...props,
        mostUsedConfig: [],
        moreFiltersConfig: [],
      },
    });

    expect(wrapper.findAllComponents({ name: "AdvancedSearchFilterSection" }).length).toBe(0);
  });
});

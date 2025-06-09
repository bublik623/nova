import { AdvancedFiltersConfig, AdvancedFiltersValues } from "@/features/advanced-search/types/filters";
import { shallowMount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import AdvancedSearchFilterSection from "../AdvancedSearchFilterSection.vue";

const dateRangeFiltersConfig: AdvancedFiltersConfig[] = [
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
];
const dateTo = new Date("2024-02-23T09:42:36.768Z");
const dateFrom = new Date("2024-02-23T09:42:36.768Z");
const dateRange = {
  from: dateFrom,
  to: dateTo,
};

const dateRangeFiltersModelValue: AdvancedFiltersValues = {
  "date-range-1": {
    type: "date-range",
    value: dateRange,
  },
};

const multiselectFiltersConfig: AdvancedFiltersConfig[] = [
  {
    key: "multiselect-1",
    label: "Multiselect 1",
    type: "multiselect",
    options: [
      { value: "multiselect-1-option-1", label: "option 1" },
      { value: "multiselect-1-option-2", label: "option 2" },
      { value: "multiselect-1-option-3", label: "option 3" },
    ],
  },
  {
    key: "multiselect-2",
    label: "Multiselect 2",
    type: "multiselect",
    options: [
      { value: "multiselect-2-option-1", label: "option 1" },
      { value: "multiselect-2-option-2", label: "option 2" },
      { value: "multiselect-2-option-3", label: "option 3" },
    ],
  },
];

describe("AdvancedSearchFilterSection", () => {
  test("renders correctly", () => {
    const wrapper = shallowMount(AdvancedSearchFilterSection, {
      props: {
        config: [...dateRangeFiltersConfig, ...multiselectFiltersConfig],
        filtersValues: dateRangeFiltersModelValue,
      },
    });

    expect(wrapper.find(".AdvancedSearchFilterSection").exists()).toBe(true);
    expect(wrapper.findAllComponents({ name: "AdvancedSearchFilterDateRange" })).toHaveLength(2);
    expect(wrapper.findAllComponents({ name: "AdvancedSearchFilterMultiselect" })).toHaveLength(2);
  });

  test("it emits on:updateFilter event when a date-range filter change", async () => {
    const wrapper = shallowMount(AdvancedSearchFilterSection, {
      props: {
        config: dateRangeFiltersConfig,
        filtersValues: dateRangeFiltersModelValue,
      },
    });

    const dateRange = wrapper.findAllComponents({ name: "AdvancedSearchFilterDateRange" }).at(0);

    await dateRange?.vm.$emit("update:modelValue", {
      type: "date-range",
      value: dateRange,
    });

    expect(wrapper.emitted("on:updateFilter")![0][0]).toEqual({
      filterKey: "date-range-1",
      value: {
        type: "date-range",
        value: dateRange,
      },
    });
  });

  test("it emits on:updateFilter event when a multiselect filter change", async () => {
    const wrapper = shallowMount(AdvancedSearchFilterSection, {
      props: {
        config: multiselectFiltersConfig,
        filtersValues: {},
      },
    });

    const multiselectFilter = wrapper.findAllComponents({ name: "AdvancedSearchFilterMultiselect" }).at(0);

    await multiselectFilter?.vm.$emit("update:modelValue", {
      type: "multiselect",
      isDefaultValue: false,
      value: [{ value: "multiselect-1-option-1", label: "option 1" }],
    });

    expect(wrapper.emitted("on:updateFilter")).toHaveLength(1);
    expect(wrapper.emitted("on:updateFilter")![0][0]).toEqual({
      filterKey: "multiselect-1",
      value: {
        type: "multiselect",
        value: [{ value: "multiselect-1-option-1", label: "option 1" }],
        isDefaultValue: false,
      },
    });
  });
});

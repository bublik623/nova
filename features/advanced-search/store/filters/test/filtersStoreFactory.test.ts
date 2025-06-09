import { vi, beforeEach, describe, expect, test } from "vitest";
import { setActivePinia, createPinia, defineStore } from "pinia";
import { buildFilterStoreFactory } from "../filtersStoreFactory";
import {
  AdvancedFilterDateRangeValue,
  AdvancedFilterMultiselectValue,
  AdvancedFilterSectionsConfig,
} from "../../../types/filters";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const dateRangeFilterKey = "daterangeFilter";
const multiselectFilterWithoutDefaultValueKey = "multiselectFilterWithoutDefaultValue";
const multiselectFilterWithDefaultValueKey = "multiselectFilterWithDefaultValue";
const filtersConfiguration: AdvancedFilterSectionsConfig = {
  mostUsedFiltersConfig: [
    { type: "date-range", key: dateRangeFilterKey, label: "date range filter" },
    {
      type: "multiselect",
      key: multiselectFilterWithoutDefaultValueKey,
      label: "multiselect filter without default value",
      options: [
        { label: "an option label", value: "an option value" },
        { label: "another option label", value: "another option value" },
      ],
    },
    {
      type: "multiselect",
      key: multiselectFilterWithDefaultValueKey,
      label: "multiselect filter with default value",
      options: [
        { label: "an option label", value: "an option value" },
        { label: "another option label", value: "another option value" },
      ],
      defaultValue: [{ label: "an option label", value: "an option value" }],
    },
  ],
  moreFiltersConfig: [],
};
const filtersConfigProvider = vi.fn<[], Ref<AdvancedFilterSectionsConfig>>();
filtersConfigProvider.mockReturnValue(ref(filtersConfiguration));

const multiselectFilterValueWithTwoOptions: AdvancedFilterMultiselectValue = {
  type: "multiselect",
  isDefaultValue: false,
  value: [
    { label: "an option label", value: "an option value" },
    { label: "another option label", value: "another option value" },
  ],
};
const multiselectFilterValueWithOneOption: AdvancedFilterMultiselectValue = {
  type: "multiselect",
  isDefaultValue: false,
  value: [{ label: "an option label", value: "an option value" }],
};
const dateRangeFilterValue: AdvancedFilterDateRangeValue = {
  type: "date-range",
  value: { from: new Date(), to: new Date() },
};
function buildStore() {
  const filterStoreFactory = buildFilterStoreFactory(filtersConfigProvider);
  const useFilterStore = defineStore("a filter store", filterStoreFactory);
  return useFilterStore();
}

describe("buildFilterStoreFactory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  test("should return a function that can be used to define a store", () => {
    const filterStoreFactory = buildFilterStoreFactory(filtersConfigProvider);
    const useFilterStore = defineStore("a filter store", filterStoreFactory);
    const store = useFilterStore();

    expect(store).toBeDefined();
  });

  describe("filter store built by the returned factory", () => {
    test("should use filters configuration returned by the provider", () => {
      const store = buildStore();

      expect(store.filtersConfig).toStrictEqual(filtersConfiguration);
    });

    describe("canClearFilters getter", () => {
      test("should be false when there are no filter values set", () => {
        const store = buildStore();

        const canClearFilters = store.canClearFilters;

        expect(canClearFilters).toBeFalsy();
      });

      test("should be true when there is at least one filter value set", () => {
        const store = buildStore();
        store.filtersValues[multiselectFilterWithoutDefaultValueKey] = multiselectFilterValueWithTwoOptions;

        const canClearFilters = store.canClearFilters;

        expect(canClearFilters).toBeTruthy();
      });
    });

    describe("canApplyFilters getter", () => {
      test("should be true when at least one filter changed after they were last applied", () => {
        const store = buildStore();
        store.filtersValues[multiselectFilterWithoutDefaultValueKey] = multiselectFilterValueWithTwoOptions;

        const canApplyFilters = store.canApplyFilters;

        expect(canApplyFilters).toBeTruthy();
      });

      test("should be false when no filter changed after they were last applied", () => {
        const store = buildStore();
        store.filtersValues[multiselectFilterWithoutDefaultValueKey] = multiselectFilterValueWithTwoOptions;
        store.appliedFiltersValues[multiselectFilterWithoutDefaultValueKey] = multiselectFilterValueWithTwoOptions;

        const canApplyFilters = store.canApplyFilters;

        expect(canApplyFilters).toBeFalsy();
      });
    });

    describe("appliedFiltersValuesWithDefaults getter", () => {
      test("should return applied filters augmented with default value of any filter for which users didn't set a value", () => {
        const store = buildStore();

        const appliedFiltersValuesWithDefaults = store.appliedFiltersValuesWithDefaults;

        expect(appliedFiltersValuesWithDefaults).toStrictEqual({
          [multiselectFilterWithDefaultValueKey]: {
            type: "multiselect",
            isDefaultValue: true,
            value: [{ label: "an option label", value: "an option value" }],
          },
        });
      });
    });

    describe("setFilter action", () => {
      test("should set the given filter value for the given filter", () => {
        const store = buildStore();

        store.setFilter(multiselectFilterWithoutDefaultValueKey, multiselectFilterValueWithTwoOptions);

        expect(store.filtersValues).toStrictEqual({
          [multiselectFilterWithoutDefaultValueKey]: multiselectFilterValueWithTwoOptions,
        });
      });
    });

    describe("removeFilter action", () => {
      test("should remove the filter value of the given filter", () => {
        const store = buildStore();
        store.filtersValues[multiselectFilterWithoutDefaultValueKey] = multiselectFilterValueWithTwoOptions;

        store.removeFilter(multiselectFilterWithoutDefaultValueKey);

        expect(store.filtersValues).toStrictEqual({});
      });
    });

    describe("removeFilterOption action", () => {
      test("should remove a single option from the filter value of a given multiselect filter when it have more than one option", () => {
        const optionToRemove = multiselectFilterValueWithTwoOptions.value[0];
        const remainingOption = multiselectFilterValueWithTwoOptions.value[1];

        const store = buildStore();
        store.filtersValues[multiselectFilterWithoutDefaultValueKey] = multiselectFilterValueWithTwoOptions;

        store.removeFilterOption(multiselectFilterWithoutDefaultValueKey, optionToRemove);

        expect(store.filtersValues).toStrictEqual({
          [multiselectFilterWithoutDefaultValueKey]: {
            type: "multiselect",
            isDefaultValue: false,
            value: [remainingOption],
          },
        });
      });

      test("should remove the whole filter value of a given multiselect filter when no options remains after removing the given one", () => {
        const optionToRemove = multiselectFilterValueWithOneOption.value[0];

        const store = buildStore();
        store.filtersValues[multiselectFilterWithoutDefaultValueKey] = multiselectFilterValueWithOneOption;

        store.removeFilterOption(multiselectFilterWithoutDefaultValueKey, optionToRemove);

        expect(store.filtersValues).toStrictEqual({});
      });

      test("should throw an error when the given filter is a date-range filter", () => {
        const optionToRemove = multiselectFilterValueWithOneOption.value[0];

        const store = buildStore();
        store.filtersValues[dateRangeFilterKey] = dateRangeFilterValue;

        expect(() => store.removeFilterOption(dateRangeFilterKey, optionToRemove)).toThrowError();
      });
    });

    describe("clearAllFilters action", () => {
      test("should remove the values of all filters", () => {
        const store = buildStore();
        store.filtersValues[multiselectFilterWithoutDefaultValueKey] = multiselectFilterValueWithTwoOptions;
        store.filtersValues[dateRangeFilterKey] = dateRangeFilterValue;

        store.clearAllFilters();

        expect(store.filtersValues).toStrictEqual({});
      });
    });

    describe("applyFilters action", () => {
      test("filter values should become applied filter values", () => {
        const store = buildStore();
        store.filtersValues = {
          anyFilter: multiselectFilterValueWithTwoOptions,
          anyOtherFilter: dateRangeFilterValue,
        };

        store.applyFilters();

        expect(store.appliedFiltersValues).toStrictEqual({
          anyFilter: multiselectFilterValueWithTwoOptions,
          anyOtherFilter: dateRangeFilterValue,
        });
      });
    });
  });
});

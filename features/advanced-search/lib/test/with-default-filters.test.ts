import { describe, expect, test } from "vitest";
import { withDefaultsFilters } from "../with-default-filters";
import {
  AdvancedFilterDateRangeConfig,
  AdvancedFilterMultiselectConfig,
  AdvancedFilterSectionsConfig,
  AdvancedFiltersValues,
} from "../../types/filters";

const dateRangeFilterAConfig: AdvancedFilterDateRangeConfig = {
  type: "date-range",
  key: "date-range-filter-a",
  label: "date-range-filter-a",
};
const dateRangeFilterBConfig: AdvancedFilterDateRangeConfig = {
  type: "date-range",
  key: "date-range-filter-b",
  label: "date-range-filter-b",
};
const multiselectFilterAConfigWithoutDefaultValue: AdvancedFilterMultiselectConfig = {
  type: "multiselect",
  key: "multiselect-filter-a",
  label: "multiselect filter a",
  options: [
    { label: "option a 1", value: "option-a-1" },
    { label: "option a 2", value: "option-a-2" },
  ],
};
const multiselectFilterAConfigWithDefaultValue: AdvancedFilterMultiselectConfig = {
  ...multiselectFilterAConfigWithoutDefaultValue,
  defaultValue: [{ label: "option a 1", value: "option-a-1" }],
};
const multiselectFilterBConfigWithoutDefaultValue: AdvancedFilterMultiselectConfig = {
  type: "multiselect",
  key: "multiselect-filter-b",
  label: "multiselect filter b",
  options: [
    { label: "option b 1", value: "option-b-1" },
    { label: "option b 2", value: "option-b-2" },
  ],
};
const multiselectFilterBConfigWithDefaultValue: AdvancedFilterMultiselectConfig = {
  ...multiselectFilterBConfigWithoutDefaultValue,
  defaultValue: [
    { label: "option b 1", value: "option-b-1" },
    { label: "option b 2", value: "option-b-2" },
  ],
};
const fromDate = new Date(2020, 1, 1);
const toDate = new Date(2020, 1, 2);

describe("withDefaultsFilters", () => {
  test("it should return only user applied filters when no filter is configured to have a default value", () => {
    const filtersConfig: AdvancedFilterSectionsConfig = {
      mostUsedFiltersConfig: [dateRangeFilterAConfig, multiselectFilterAConfigWithoutDefaultValue],
      moreFiltersConfig: [dateRangeFilterBConfig, multiselectFilterBConfigWithoutDefaultValue],
    };
    const appliedFilters: AdvancedFiltersValues = {
      "date-range-filter-a": { type: "date-range", value: { from: fromDate, to: toDate } },
    };

    const result = withDefaultsFilters(appliedFilters, filtersConfig);

    expect(result).toEqual(appliedFilters);
  });

  test("it should return only user applied filters when any filter is configured to have a default value but user specified a value explicitly", () => {
    const filtersConfig: AdvancedFilterSectionsConfig = {
      mostUsedFiltersConfig: [dateRangeFilterAConfig, multiselectFilterAConfigWithDefaultValue],
      moreFiltersConfig: [dateRangeFilterBConfig, multiselectFilterBConfigWithDefaultValue],
    };
    const appliedFilters: AdvancedFiltersValues = {
      "date-range-filter-a": { type: "date-range", value: { from: fromDate, to: toDate } },
      "multiselect-filter-a": {
        type: "multiselect",
        value: [{ label: "option a 2", value: "option-a-2" }],
        isDefaultValue: false,
      },
      "multiselect-filter-b": {
        type: "multiselect",
        value: [{ label: "option b 1", value: "option-b-1" }],
        isDefaultValue: false,
      },
    };

    const result = withDefaultsFilters(appliedFilters, filtersConfig);

    expect(result).toEqual(appliedFilters);
  });

  test("it should return user applied filters together with default values for filters that have been configured with default values and for which the user didn't specify a value explicitly", () => {
    const filtersConfig: AdvancedFilterSectionsConfig = {
      mostUsedFiltersConfig: [dateRangeFilterAConfig, multiselectFilterAConfigWithDefaultValue],
      moreFiltersConfig: [dateRangeFilterBConfig, multiselectFilterBConfigWithDefaultValue],
    };
    const appliedFilters: AdvancedFiltersValues = {
      "date-range-filter-a": { type: "date-range", value: { from: fromDate, to: toDate } },
    };
    const expectedResult: AdvancedFiltersValues = {
      "date-range-filter-a": { type: "date-range", value: { from: fromDate, to: toDate } },
      "multiselect-filter-a": {
        type: "multiselect",
        value: [{ label: "option a 1", value: "option-a-1" }],
        isDefaultValue: true,
      },
      "multiselect-filter-b": {
        type: "multiselect",
        value: [
          { label: "option b 1", value: "option-b-1" },
          { label: "option b 2", value: "option-b-2" },
        ],
        isDefaultValue: true,
      },
    };

    const result = withDefaultsFilters(appliedFilters, filtersConfig);

    expect(result).toEqual(expectedResult);
  });
});

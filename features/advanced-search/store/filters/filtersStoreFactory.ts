import { isEqual } from "lodash";
import { defineStore } from "pinia";
import { type Option } from "@/types/Option";
import {
  type AdvancedFilterSectionsConfig,
  type AdvancedFilterDateRangeValue,
  type AdvancedFilterMultiselectValue,
} from "../../types/filters";
import { withDefaultsFilters } from "../../lib/with-default-filters";

export type FiltersConfigurationProvider = () => Ref<AdvancedFilterSectionsConfig>;

export type FiltersStore = ReturnType<
  ReturnType<typeof defineStore<string, ReturnType<ReturnType<typeof buildFilterStoreFactory>>>>
>;

export function buildFilterStoreFactory(filtersConfigurationProvider: FiltersConfigurationProvider) {
  return function filtersStoreFactory() {
    const filtersConfig = filtersConfigurationProvider();
    const filtersValues = ref<Record<string, AdvancedFilterDateRangeValue | AdvancedFilterMultiselectValue>>({});
    const appliedFiltersValues = ref<Record<string, AdvancedFilterDateRangeValue | AdvancedFilterMultiselectValue>>({});

    const canClearFilters = computed(() => Object.keys(filtersValues.value).length > 0);
    const anyPendingFilter = computed(() => !isEqual(filtersValues.value, appliedFiltersValues.value));
    const canApplyFilters = computed(() => anyPendingFilter.value);

    const appliedFiltersValuesWithDefaults = computed(() => {
      return withDefaultsFilters(appliedFiltersValues.value, filtersConfig.value);
    });

    function setFilter(filterKey: string, filterValue: AdvancedFilterDateRangeValue | AdvancedFilterMultiselectValue) {
      filtersValues.value[filterKey] = filterValue;
    }

    function removeFilter(filterKey: string) {
      const newFiltersValues = { ...filtersValues.value };
      delete newFiltersValues[filterKey];
      filtersValues.value = newFiltersValues;
    }

    function removeFilterOption(filterKey: string, optionToRemove: Option) {
      const newFiltersValues = { ...filtersValues.value };
      const filterValue = newFiltersValues[filterKey];

      if (filterValue.type !== "multiselect") {
        throw new Error(
          `You can remove an option only from a multi-select filter. ${filterKey} is ${filterValue.type}`
        );
      }

      filterValue.value = filterValue.value.filter((option) => option.value !== optionToRemove.value);
      if (!filterValue.value.length) {
        delete newFiltersValues[filterKey];
      }

      filtersValues.value = newFiltersValues;
    }

    function clearAllFilters() {
      filtersValues.value = {};
    }

    function applyFilters() {
      appliedFiltersValues.value = { ...filtersValues.value };
    }

    return {
      filtersConfig,
      filtersValues,
      appliedFiltersValues,
      canClearFilters,
      canApplyFilters,
      appliedFiltersValuesWithDefaults,
      setFilter,
      removeFilter,
      removeFilterOption,
      clearAllFilters,
      applyFilters,
    };
  };
}

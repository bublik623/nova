import { AdvancedFilterMultiselectConfig, AdvancedFilterSectionsConfig, AdvancedFiltersValues } from "../types/filters";

/**
 * Returns the the merge of default filters values (if any) with the filter values applied by the user.
 * Default filters values are overridden by those applied by the user.
 */
export function withDefaultsFilters(
  appliedFilters: AdvancedFiltersValues,
  filtersConfig: AdvancedFilterSectionsConfig
) {
  const defaultFiltersValuesEntryList = [...filtersConfig.mostUsedFiltersConfig, ...filtersConfig.moreFiltersConfig]
    .filter((filterConfig) => filterConfig.type === "multiselect")
    .map((filterConfig) => filterConfig as AdvancedFilterMultiselectConfig)
    .filter((multiselectFilterConfig) => multiselectFilterConfig.defaultValue)
    .map((filterConfig) => [
      filterConfig.key,
      { type: "multiselect", value: filterConfig.defaultValue!, isDefaultValue: true },
    ]);

  const defaultFilters: AdvancedFiltersValues = Object.fromEntries(defaultFiltersValuesEntryList);

  return { ...defaultFilters, ...appliedFilters };
}

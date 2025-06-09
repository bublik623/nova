import builder from "@rsql/builder";
import { emit } from "@rsql/emitter";
import { AdvancedFilterDateRangeValue, AdvancedFilterMultiselectValue, AdvancedFiltersValues } from "../types/filters";
import { formatDateTimeAsUTCRegardlessOfTimezone } from "@/utils/date-utils";

/**
 * Serialize the given filters in RSQL format.
 * @param appliedFilters the filters to be serialized in RSQL
 * @param keyMap the map between the filter keys expressed in the given appliedFilters and the attribute keys that the filters should be applied to
 * @returns a string representing the filters in RSQL format
 */
export function serializeToRsql(appliedFilters: AdvancedFiltersValues, keyMap: Record<string, string>) {
  const comparisonNodes = Object.entries(appliedFilters).flatMap(([appliedFilterKey, appliedFilter]) => {
    const attributeKey = keyMap[appliedFilterKey];

    if (!attributeKey) {
      throw new Error(`filtering not supported on '${appliedFilterKey}'`);
    }

    switch (appliedFilter.type) {
      case "date-range":
        return convertDateRangeFilter(attributeKey, appliedFilter);
      case "multiselect":
        return convertMultiselectFilter(attributeKey, appliedFilter);
    }

    // this unreachable return statement is to prevent SonarQube from complaining about inconsistent return style
    // that's confirmed to be a false positive in situations like this (a switch that cover each case)
    // https://community.sonarsource.com/t/typescript-s3801-false-positive-when-a-switch-handles-all-variants/91799
    return [];
  });

  if (comparisonNodes.length === 0) {
    return "";
  }

  const rootNode = builder.and(...comparisonNodes);
  return emit(rootNode);
}

/**
 * Convert the given DateRange filter to one ComparisonNode per each restricted bound (both upper and lower bounds, upper bound only or lower bound only).
 * If the given DateRange filter is not constrained to any bound, then an empty array is returned because no filter needs to be applied.
 * @param attributeKey the key of the attribute against which to filter
 * @param filterValue the DateRange filter to apply to the given attributeKey
 * @returns an array of ComparisonNode
 */
function convertDateRangeFilter(attributeKey: string, filterValue: AdvancedFilterDateRangeValue) {
  const serializedFrom = formatDateTimeAsUTCRegardlessOfTimezone(filterValue.value.from);
  const serializedTo = formatDateTimeAsUTCRegardlessOfTimezone(filterValue.value.to);

  if (serializedFrom && serializedTo) {
    return [builder.ge(attributeKey, serializedFrom), builder.le(attributeKey, serializedTo)];
  } else if (serializedFrom) {
    return [builder.ge(attributeKey, serializedFrom)];
  } else if (serializedTo) {
    return [builder.le(attributeKey, serializedTo)];
  } else {
    return [];
  }
}

/**
 * Convert the given Multiselect filter to a ComparisonNode.
 * If the given Multiselect filter have no selected values than an empty array is returned because no filter needs to be applied.
 * @param attributeKey the key of the attribute against which to filter
 * @param filterValue the Multiselect filter to apply to the given attributeKey
 * @returns an array of ComparisonNode
 */
function convertMultiselectFilter(attributeKey: string, filterValue: AdvancedFilterMultiselectValue) {
  const values = filterValue.value.map((item) => item.value);
  return filterValue.value.length > 0 ? [builder.in(attributeKey, values)] : [];
}

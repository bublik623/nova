<template>
  <div class="AdvancedSearchFilterSection">
    <div
      v-for="filter in config"
      :key="filter.key"
      class="mt-1"
      :data-testid="`advanced-search-filter-section-${filter.key}`"
    >
      <template v-if="filter.type === 'date-range'">
        <h4 class="label">{{ filter.label }}</h4>
        <AdvancedSearchFilterDateRange
          class="mt-1"
          :config="filter"
          :model-value="safeDateRangeRef(filter.key)"
          @update:model-value="(updatedFilterValue) => emitUpdateEvent(filter.key, updatedFilterValue)"
        />
      </template>

      <template v-else-if="filter.type === 'multiselect'">
        <AdvancedSearchFilterMultiselect
          class="mt-2"
          :config="filter"
          :model-value="safeMultiselectRef(filter.key)"
          @update:model-value="(updatedFilterValue) => emitUpdateEvent(filter.key, updatedFilterValue)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AdvancedFilterDateRangeValue,
  AdvancedFiltersConfig,
  AdvancedFiltersValues,
  advancedFilterDateRangeSchema,
  advancedFilterMultiselectSchema,
  AdvancedFilterMultiselectValue,
} from "../../types/filters";
import AdvancedSearchFilterDateRange from "./AdvancedSearchFilterDateRange.vue";
import AdvancedSearchFilterMultiselect from "./AdvancedSearchFilterMultiselect.vue";

interface Props {
  config: AdvancedFiltersConfig[];
  filtersValues: AdvancedFiltersValues;
}

interface Events {
  (
    e: "on:updateFilter",
    args: { filterKey: string; value: AdvancedFilterDateRangeValue | AdvancedFilterMultiselectValue }
  ): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const safeDateRangeRef = computed(() => (key: string) => {
  const value = props.filtersValues[key];

  // We always need to return a safe ref,
  // we first try to check with zod if the value is valid
  // if it's not, we return a safe ref with the default value
  // NB: the first time it renders, the value will be undefined
  try {
    return advancedFilterDateRangeSchema.parse(value);
  } catch (error) {
    return {
      type: "date-range",
      value: { from: undefined, to: undefined },
    } as const;
  }
});

const safeMultiselectRef = computed(() => (key: string) => {
  let value: AdvancedFilterMultiselectValue;

  try {
    value = advancedFilterMultiselectSchema.parse(props.filtersValues[key]);
  } catch (error) {
    value = {
      type: "multiselect",
      value: [],
      isDefaultValue: false,
    };
  }

  return value;
});

function emitUpdateEvent(
  filterKey: string,
  updatedFilterValue: AdvancedFilterMultiselectValue | AdvancedFilterDateRangeValue
) {
  emits("on:updateFilter", { filterKey, value: updatedFilterValue });
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.AdvancedSearchFilterSection {
  overflow: visible;

  .label {
    @include font-regular(12);
  }
}
</style>

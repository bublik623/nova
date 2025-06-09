<template>
  <div class="ChipsWrapper">
    <div ref="chips_wrapper" :is-collapsed="isCollapsed || null" class="ChipsWrapper__chips flex flex-wrap gap-1">
      <template v-for="chip in chips" :key="chip.source">
        <NovaChip
          v-if="chip.source.type === 'multiselect'"
          :height="chipHeight"
          :data-filter-key="chip.source.filterKey"
          :data-filter-option="chip.source.option.value"
          @click:close="$emit('on:removeChip', chip)"
        >
          {{ chip.label }}
        </NovaChip>
        <NovaChip
          v-else
          :height="chipHeight"
          :data-filter-key="chip.source.filterKey"
          @click:close="$emit('on:removeChip', chip)"
        >
          {{ chip.label }}
        </NovaChip>
      </template>
    </div>
    <div>
      <NovaButtonIcon
        v-show="isMultiLine && chips.length"
        class="ChipsWrapper__button"
        name="chevron-down"
        :size="14"
        :is-collapsed="isCollapsed || null"
        @click="isCollapsed = !isCollapsed"
      ></NovaButtonIcon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DATE_FORMAT_SHORT } from "@/constants/date.constants";
import {
  AdvancedFilterDateRangeValue,
  AdvancedFilterMultiselectValue,
  AdvancedFiltersValues,
} from "../../types/filters";
import NovaChip from "@/ui-kit/NovaChip/NovaChip.vue";
import { format } from "date-fns";
import { Option } from "@/types/Option";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";
import { useDetectMultiLine } from "@/features/core-shared/composables/useDetectMultipleLines";

type MultiselectFilterChipSource = { type: "multiselect"; filterKey: string; option: Option };
type DateRangeFilterChipSource = { type: "date-range"; filterKey: string };
type Chip = { label: string; source: MultiselectFilterChipSource | DateRangeFilterChipSource };

const props = defineProps<{ appliedFilters: AdvancedFiltersValues }>();
defineEmits<(e: "on:removeChip", chip: Chip) => void>();

const chips = computed(() => {
  if (!props.appliedFilters) {
    return [];
  }

  return Object.entries(props.appliedFilters).flatMap(([filterKey, filterValue]) => {
    if (filterValue.type === "multiselect") {
      return chipsFromMultiselectFilterValue(filterKey, filterValue);
    }
    if (filterValue.type === "date-range") {
      return [chipFromDateRangeFilterValue(filterKey, filterValue)];
    }
    return [];
  });
});

function chipsFromMultiselectFilterValue(filterKey: string, filterValue: AdvancedFilterMultiselectValue): Chip[] {
  return filterValue.value.map((option) => ({
    label: option.label,
    source: { type: "multiselect", filterKey, option },
  }));
}

function chipFromDateRangeFilterValue(filterKey: string, filterValue: AdvancedFilterDateRangeValue): Chip {
  return {
    label: generateInterval(filterValue.value),
    source: { type: "date-range", filterKey },
  };
}

const generateInterval = (range: AdvancedFilterDateRangeValue["value"]) => {
  let dateRangeString = "";

  if (range.from) {
    dateRangeString += format(range.from, DATE_FORMAT_SHORT);
  }
  if (range.from && range.to) {
    dateRangeString += " - ";
  }
  if (range.to) {
    dateRangeString += format(range.to, DATE_FORMAT_SHORT);
  }
  return dateRangeString;
};

const chips_wrapper = ref<HTMLDivElement | null>(null);
const isCollapsed = ref(true);
const chipHeight = 22;

const { isMultiLine } = useDetectMultiLine(chips_wrapper);
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.ChipsWrapper {
  display: flex;
  justify-content: space-between;
  align-items: start;

  &__chips {
    max-height: rem(22);
    line-height: rem(22);
    overflow: hidden;
    display: flex;

    &:not([is-collapsed]) {
      max-height: 100%;
    }
  }

  &__button {
    transition: all ease-in-out 0.2s;
    position: relative;
    top: -2px;

    &:not([is-collapsed]) {
      transform: rotate(-180deg);
    }
  }
}
</style>

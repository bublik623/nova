<template>
  <div class="AdvancedSearchFilterDateRange">
    <NovaInputDate
      :can-select-all-dates="true"
      :id="`advanced-search-date-range-${config.key}`"
      :placeholder="{
        from: $t('advanced-search.filters.placeholder.from'),
        to: $t('advanced-search.filters.placeholder.to'),
      }"
      :model-value="modelValue?.value"
      :hide-label="true"
      @update:model-value="handleEmits"
    />
  </div>
</template>

<script setup lang="ts">
import { DateRange } from "@/types/DateTypes";
import NovaInputDate from "@/ui-kit/NovaInputDate/NovaInputDate.vue";
import { AdvancedFilterDateRangeConfig, AdvancedFilterDateRangeValue } from "../../types/filters";

interface Props {
  config: AdvancedFilterDateRangeConfig;
  modelValue: AdvancedFilterDateRangeValue;
}

interface Events {
  (event: "update:modelValue", value: AdvancedFilterDateRangeValue): void;
}

defineProps<Props>();
const emits = defineEmits<Events>();

function handleEmits(e: DateRange) {
  // We need to set the time to the end of the day for the to date
  // Otherwise we would only search until 00:00 of the selected day
  const upperBound = e.to ? new Date(e.to) : undefined;
  upperBound?.setHours(23, 59, 59, 999);

  emits("update:modelValue", {
    type: "date-range",
    value: {
      from: e.from,
      to: upperBound,
    },
  });
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

// *** Workaround ***
// We have to change the style of the placeholder of the date input
// but I don't want to add and drill down the slots to at least 3 components
// because this is only used once (at least in the current specs)
:deep(.DateInput__placeholder) {
  color: var(--color-text-100);
}
</style>

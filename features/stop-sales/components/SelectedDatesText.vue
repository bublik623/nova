<script setup lang="ts">
import { DateRange } from "@/types/DateTypes";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { format } from "date-fns";

const selectedDateRange = defineModel<DateRange>("selectedDateRange");
const selectedItemsCount = defineModel<number>("selectedItemsCount");

function formatDate(date: Date): string {
  return format(date, "dd/MM/yy");
}
</script>

<template>
  <span v-if="!selectedDateRange" class="text-sm font-normal text-text-70 text-ellipsis whitespace-nowrap">
    {{
      selectedItemsCount
        ? $t("stop_sales.filter.common.selected", { placeholders: { count: selectedItemsCount } })
        : $t("stop_sales.filter.common.select_filter")
    }}
  </span>

  <span v-else class="items-center flex gap-1 text-sm font-normal text-text-70">
    <span class="text-text-100 w-fit font-semibold hidden lg:inline capitalize">
      {{ $t("common.from") }}
    </span>
    <span
      class="text-nowrap"
      :class="{ 'font-italic': !selectedDateRange.from, 'text-text-100': selectedDateRange.from }"
    >
      {{ selectedDateRange.from ? `${formatDate(selectedDateRange.from)}` : "dd/mm/yy" }}
    </span>
    <NovaIcon class="text-text-100" name="arrow-right" />
    <span class="text-text-100 font-semibold hidden lg:inline capitalize">{{ $t("common.to") }}</span>
    <span class="text-nowrap" :class="{ 'font-italic': !selectedDateRange.to, 'text-text-100': selectedDateRange.to }">
      {{ selectedDateRange.to ? `${formatDate(selectedDateRange.to)}` : "dd/mm/yy" }}
    </span>
  </span>
</template>

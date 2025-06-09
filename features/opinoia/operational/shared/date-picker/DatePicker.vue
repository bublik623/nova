<script setup lang="ts">
import { ref, computed } from "vue";
import { isDate } from "date-fns";
import { useFloating, autoUpdate } from "@floating-ui/vue";
import { onClickOutside } from "@vueuse/core";
import NovaDatePicker from "@/ui-kit/NovaDatePicker/NovaDatePicker.vue";
import { DateRange } from "@/types/DateTypes";
import { formatDateRangeLabel } from "@/features/opinoia/shared/utils/date-utils";

const selectedDates = defineModel<DateRange>("selectedDates", { default: { from: undefined, to: undefined } });

const selectedRange = ref<DateRange>({ from: undefined, to: undefined });
const datesFromSelectedRange = computed<Date[]>(() => {
  const dates: Date[] = [];
  if (selectedRange.value.from && isDate(selectedRange.value.from)) {
    dates.push(selectedRange.value.from);
  }
  if (selectedRange.value.to && isDate(selectedRange.value.to)) {
    dates.push(selectedRange.value.to);
  }
  return dates;
});

const isOpen = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);

const togglePopover = () => {
  isOpen.value = !isOpen.value;
};

// a variable to track if the user selects a range and then clicks any other date. So that we can reset the range selection
const dateClickCount = ref(0);
function handleUpdateDateRange(dates: Date[]) {
  dateClickCount.value++;

  if (dateClickCount.value === 1) {
    selectedRange.value = { from: dates[0], to: undefined };
  } else if (dateClickCount.value === 2) {
    const [startDate, endDate] = dates.sort((a, b) => a.getTime() - b.getTime());
    if (startDate.getTime() === endDate.getTime()) {
      // If the same date is clicked twice, reset the selection
      dateClickCount.value = 0;
      selectedRange.value = { from: undefined, to: undefined };
    } else {
      selectedRange.value = { from: startDate, to: endDate };
    }
  } else {
    // Reset after two clicks
    dateClickCount.value = 1;
    selectedRange.value = { from: dates[dates.length - 1], to: undefined };
  }

  // update dates
  if (selectedRange.value.from && selectedRange.value.to) {
    selectedDates.value = { from: selectedRange.value.from, to: selectedRange.value.to };
  } else {
    selectedDates.value = { from: undefined, to: undefined };
  }
}

const selectedRangeText = computed(() => {
  return formatDateRangeLabel(selectedRange.value.from, selectedRange.value.to);
});

const { floatingStyles } = useFloating(triggerRef, dropdownRef, {
  placement: "bottom",
  open: isOpen,
  whileElementsMounted: autoUpdate,
});

onClickOutside(dropdownRef, () => {
  isOpen.value = false;
});

watch(
  () => selectedDates.value,
  () => {
    if (selectedDates.value.from && selectedDates.value.to) {
      selectedRange.value = { from: selectedDates.value.from, to: selectedDates.value.to };
    }
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <div class="w-full relative">
    <button ref="triggerRef" data-testid="date-picker-trigger" type="button" class="w-full" @click="togglePopover">
      <span class="truncate">
        {{ selectedRangeText || "&nbsp;" }}
      </span>
    </button>

    <div v-if="isOpen" ref="dropdownRef" :style="floatingStyles" class="z-50 mt-1 min-w-full">
      <div class="bg-white shadow-lg border rounded p-1 size-fit">
        <NovaDatePicker :dates="datesFromSelectedRange" mode="range" @select:dates="handleUpdateDateRange" />
      </div>
    </div>
  </div>
</template>

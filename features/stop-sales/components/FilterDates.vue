<script lang="ts" setup>
import { MultiSelect, MultiSelectPortal, MultiSelectTrigger } from "@/features/stop-sales/components/MultiSelect";
import { DateRange } from "@/types/DateTypes";
import SelectedDatesText from "./SelectedDatesText.vue";
import FilterButton from "./FilterButton.vue";
import NovaDatePicker, { Props as NovaDatePickerProps } from "@/ui-kit/NovaDatePicker/NovaDatePicker.vue";
import { isDate } from "date-fns";
import NovaRadioCard from "@/ui-kit/NovaRadioCard/NovaRadioCard.vue";
import ScheduleDays from "@/features/experience-shared/components/ScheduleDays.vue";
import { useScheduleDays } from "@/features/experience-shared/composables/useScheduleDays";

const selectedDates = defineModel<Date[]>("selectedDates", { default: [] });
const excludedDates = defineModel<Date[]>("excludedDates", { default: [] });

const datePickerMode = defineModel<NovaDatePickerProps["mode"]>("range");

const disabled = defineModel<boolean>("disabled");

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

const selectedSingleDates = ref<Date[]>([]);

const selectedScheduleDays = useScheduleDays(selectedRange, handleScheduleDaysUpdate);

function handleScheduleDaysUpdate() {
  if (selectedRange.value.from && selectedRange.value.to) {
    const dates = getDates(selectedRange.value.from, selectedRange.value.to);

    const excludedDays = Object.values(selectedScheduleDays.value).reduce<number[]>((res, current, idx) => {
      if (!current.checked) {
        res.push(idx === 6 ? 0 : idx + 1);
      }
      return res;
    }, []);

    const filteredDates = dates.filter((d) => {
      return excludedDays.includes(d.getDay());
    });
    excludedDates.value = filteredDates;
  }
}

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
    selectedDates.value = [selectedRange.value.from, selectedRange.value.to];
  } else {
    selectedDates.value = [];
  }
}

async function handleUpdateSingleDates(dates: Date[]) {
  const sortedDates = [...dates];
  sortedDates.sort((a, b) => a.getTime() - b.getTime());
  selectedSingleDates.value = sortedDates;

  if (sortedDates.length === 1) {
    selectedRange.value = { from: sortedDates[0], to: undefined };
  } else {
    selectedRange.value = { from: sortedDates[0], to: sortedDates[sortedDates.length - 1] };
  }

  selectedDates.value = dates;
}

function resetDates() {
  selectedDates.value = [];
  selectedSingleDates.value = [];
  selectedRange.value = { from: undefined, to: undefined };
  excludedDates.value = [];
}

function handleChangeDatePickerMode(mode: NovaDatePickerProps["mode"]) {
  datePickerMode.value = mode;
  resetDates();
}

watch(selectedDates, () => {
  if (selectedDates.value.length === 0 && selectedRange.value.from && selectedRange.value.to) {
    selectedRange.value = { from: undefined, to: undefined };
  }
  if (selectedDates.value.length === 2) {
    selectedRange.value = { from: selectedDates.value[0], to: selectedDates.value[1] };
  }
});
</script>
<template>
  <MultiSelect :selected-values="[]" placement="bottom-end">
    <template #default="{ isDropdownOpen }">
      <MultiSelectTrigger v-slot="context" as-child>
        <FilterButton
          v-bind="context?.triggerProps"
          class="w-full flex-wrap"
          :title="$t('stop_sales.filter.dates.title')"
          data-testid="button-dates"
          :is-open="isDropdownOpen"
          :selected-items-count="selectedDates.length"
          :disabled="disabled"
          @click="context?.actions.handleToggle"
        >
          <SelectedDatesText :selected-date-range="{ from: selectedRange.from, to: selectedRange.to }" />
        </FilterButton>
      </MultiSelectTrigger>
      <MultiSelectPortal
        class="px-5 py-4 content max-w-[calc(48rem+2px)] mt-[1px] bg-white w-full ring-1 ring-primary-100 rounded-b-lg"
        data-testid="filter-dates-content"
      >
        <div class="flex gap-6">
          <NovaRadioCard
            :title="$t('stop_sales.filter.dates.range.title')"
            value="range"
            :checked="datePickerMode === 'range'"
            data-testid="date-mode-range"
            @input="handleChangeDatePickerMode('range')"
          >
            <template #description>{{ $t("stop_sales.filter.dates.range.description") }}</template>
          </NovaRadioCard>
          <NovaRadioCard
            :title="$t('stop_sales.filter.dates.single.title')"
            value="multiple"
            :checked="datePickerMode === 'multiple'"
            data-testid="date-mode-multiple"
            @input="handleChangeDatePickerMode('multiple')"
          >
            <template #description>{{ $t("stop_sales.filter.dates.single.description") }}</template>
          </NovaRadioCard>
        </div>
        <div class="pt-4">
          <div v-if="datePickerMode === 'range'">
            <NovaDatePicker
              v-model="selectedRange"
              remove-border
              mode="range"
              :dates="datesFromSelectedRange"
              @select:dates="handleUpdateDateRange"
            />

            <ScheduleDays v-model="selectedScheduleDays" select-all class="mt-4" />
          </div>
          <div v-else>
            <NovaDatePicker
              v-model="selectedSingleDates"
              mode="multiple"
              :dates="selectedSingleDates"
              @select:dates="handleUpdateSingleDates"
            />
          </div>
        </div>
      </MultiSelectPortal>
    </template>
  </MultiSelect>
</template>

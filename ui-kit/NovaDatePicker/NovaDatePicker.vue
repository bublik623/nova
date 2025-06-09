<template>
  <div class="DatePicker" data-testid="nova-date-picker">
    <MonthSelector v-model="currentDatePreview" :can-select-all-dates="canSelectAllDates" />

    <div class="DatePicker__weekdays">
      <span v-for="(day, index) in SHORT_DAY_NAMES" :key="day" :selected="selectedWeekDays.has(index) || null">
        {{ day }}
      </span>
    </div>

    <div class="DatePicker__days" :data-month="currentDatePreview.getMonth()">
      <DateCard
        v-for="day in days"
        :key="day.toISOString()"
        :class="day"
        :date="day"
        :is-selected="isDateSelected(day)"
        :date-preview="currentDatePreview"
        :range="mode === 'range' ? dates : undefined"
        :unavailable="isUnavailable(day)"
        data-testid="date-card"
        @click="handleSelectDate(day)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import DateCard from "../NovaDatePicker/components/DateCard.vue";
import MonthSelector from "../NovaDatePicker/components/MonthSelector.vue";
import { startOfMonth, endOfMonth, compareDatesWithoutTime, getDates } from "@/utils/date-utils";
import { SHORT_DAY_NAMES } from "@/constants/date.constants";
import { addMonths, subMonths } from "date-fns";

export interface Props {
  dates: Date[];
  selectingDate?: "FROM" | "TO";
  mode: "single" | "multiple" | "range";
  maxMonthsTimespan?: number;
  // Remove all the date selection limitations
  canSelectAllDates?: boolean;
}

interface Events {
  (e: "select:dates", date: Date[]): void;
  (e: "update:selectingDate", val: "FROM" | "TO"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const dateSelectionBoundaries = computed(() => {
  if (!props.maxMonthsTimespan || props.mode === "single" || !props.dates[0]) {
    return { earliest: undefined, latest: undefined };
  }
  const baseDate = props.dates[0];
  return {
    earliest: subMonths(baseDate, props.maxMonthsTimespan),
    latest: addMonths(baseDate, props.maxMonthsTimespan),
  };
});

function isUnavailable(day: Date) {
  if (props.canSelectAllDates) {
    return false;
  }
  if (day < TODAY) {
    return true;
  }
  const { earliest, latest } = dateSelectionBoundaries.value;
  return (earliest && day < earliest) || (latest && day > latest);
}

function handleSelectDate(date: Date) {
  switch (props.mode) {
    case "multiple":
      handleSelectMultipleDates(date);
      break;
    case "range":
      handleSelectDateRange(date);
      break;
    default:
      emit("select:dates", [date]);
  }
}

function handleSelectMultipleDates(date: Date) {
  const newDateRange: Date[] = [...props.dates];

  if (props.mode === "multiple") {
    const existingDateIndex = newDateRange.findIndex((d) => compareDatesWithoutTime(d, date));
    if (existingDateIndex === -1) {
      newDateRange.push(date);
    } else {
      newDateRange.splice(existingDateIndex, 1);
    }
    emit("select:dates", newDateRange);
  }
}

function handleSelectDateRange(date: Date) {
  const dates = [...props.dates];
  let startDate = dates[0];
  let endDate = dates[dates.length - 1];

  // Select start date as a first date
  if (startDate === undefined) {
    startDate = date;
    endDate = date;
    emit("update:selectingDate", "TO");
  } else if (props.selectingDate === "FROM" || (props.selectingDate === "TO" && startDate >= date)) {
    // Selecting startDate
    startDate = date;
    emit("update:selectingDate", "TO");

    if (!endDate || startDate >= endDate) {
      endDate = date;
    }
  } else {
    // Selecting endDate
    endDate = date;
    emit("update:selectingDate", "FROM");
  }

  const newRange = startDate === endDate ? [startDate] : [startDate, endDate];
  emit("select:dates", newRange);
}

const currentDatePreview = ref(props.dates[0] ?? new Date());
watch(
  () => props.dates,
  (newVal) => {
    if (newVal && newVal.length > 0) {
      currentDatePreview.value = newVal[newVal.length - 1];
    }
  }
);

const selectedWeekDays = computed(() => {
  let dates = [...props.dates];

  if (props.mode === "range") {
    dates = getDates(dates[0], dates[1]);
  }

  return new Set(
    dates.map((d) => {
      const day = d.getDay() - 1; // Our week starts from Monday and ends Sunday
      return day < 0 ? 6 : day;
    })
  );
});

const days = computed(() => {
  const firstDay = startOfMonth(currentDatePreview.value);
  const lastDay = endOfMonth(currentDatePreview.value);

  const numberOfWeeks = Math.ceil((getDay(firstDay) + lastDay.getDate()) / 7);

  // Set iteration helper to 1st visible day of current or previous month.
  const iterationHelper = new Date(firstDay);
  iterationHelper.setDate(-1 * getDay(iterationHelper) + 1);

  const dates: Date[] = [];

  [...Array(numberOfWeeks * 7)].forEach(() => {
    dates.push(new Date(iterationHelper.getTime()));
    iterationHelper.setDate(iterationHelper.getDate() + 1);
  });

  return dates;
});

function getDay(date: Date): number {
  // By default the week starts Sunday (sun = 0, sat = 6), so we need to shift by 1 in order to start on Monday
  return (date.getDay() - 1 + 7) % 7;
}

function isDateSelected(day: Date) {
  if (props.dates.length === 0) {
    return false;
  }

  if (props.mode === "multiple") {
    return props.dates.some((d) => compareDatesWithoutTime(d, day));
  }

  return (
    compareDatesWithoutTime(props.dates[0], day) || compareDatesWithoutTime(props.dates[props.dates.length - 1], day)
  );
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.DatePicker {
  background-color: var(--color-white);
  width: rem(336);
  padding-bottom: rem(15);
  border: var(--border-default);
  border-radius: var(--border-radius-default);

  &__weekdays,
  &__days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }

  &__weekdays {
    padding: rem(8) 0;
    text-align: center;
    @include font-regular(12);

    & > span[selected] {
      color: var(--color-primary-100);
    }
  }
}
</style>

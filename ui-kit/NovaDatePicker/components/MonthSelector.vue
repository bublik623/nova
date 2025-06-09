<template>
  <div class="MonthSelector">
    <NovaButtonIcon
      name="chevron-left"
      :size="14"
      :disabled="isPrevMonthDisabled()"
      data-testid="prev-month"
      @click="$emit('update:modelValue', getPrevMonth())"
    />

    {{ currentMonth }} {{ modelValue.getFullYear() }}

    <NovaButtonIcon
      name="chevron-right"
      :size="14"
      data-testid="next-month"
      @click="$emit('update:modelValue', getNextMonth())"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import NovaButtonIcon from "@/ui-kit/NovaButtonIcon/NovaButtonIcon.vue";

interface Props {
  modelValue: Date;
  // Remove all the date selection limitations
  canSelectAllDates?: boolean;
}

interface Events {
  (e: "update:modelValue", date: Date): void;
}

const props = defineProps<Props>();
defineEmits<Events>();

const LOCALE = "en-gb";
const todaysDate = new Date();

const currentMonth = computed(() => {
  return new Intl.DateTimeFormat(LOCALE, { month: "long" }).format(props.modelValue);
});

function getPrevMonth() {
  const newDate = new Date(props.modelValue.getTime());
  newDate.setDate(1);
  newDate.setMonth(newDate.getMonth() - 1);
  return newDate;
}

function getNextMonth() {
  const newDate = new Date(props.modelValue.getTime());
  newDate.setDate(1);
  newDate.setMonth(newDate.getMonth() + 1);
  return newDate;
}

function isPrevMonthDisabled() {
  if (props.canSelectAllDates) {
    return false;
  } else {
    const prevMonth = getPrevMonth().getMonth();
    const prevMonthYear = getPrevMonth().getFullYear();
    const thisMonth = todaysDate.getMonth();
    const thisYear = todaysDate.getFullYear();
    return (prevMonth < thisMonth && prevMonthYear <= thisYear) || prevMonthYear < thisYear;
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.MonthSelector {
  padding: rem(12) rem(2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  @include font-bold(14);
}
</style>

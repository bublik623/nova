<template>
  <div class="schedule" :invalid="isInvalid || null">
    <div v-if="selectAll" class="flex items-center gap-2">
      <NovaCheckbox
        value=""
        :status="selectAllStatus"
        data-testid="schedule-select-all"
        @update:status="handleSelectAll"
      />
      <span class="text-sm font-light">{{ $t("common.select_all") }}</span>
    </div>
    <div
      v-for="(translateKey, dayName) in daysWithKeys"
      :key="dayName"
      :data-testid="`schedule-day`"
      class="schedule__day"
    >
      <NovaCheckbox
        :id="`day-input-${dayName.toLowerCase()}`"
        :value="dayName"
        :status="days[dayName].checked ? 'checked' : 'unchecked'"
        :disabled="days[dayName].isDisabled || disabled"
        @update:status="handleChange"
      ></NovaCheckbox>
      <label :for="`day-input-${dayName}`" class="schedule__label">{{ $t(translateKey) }}</label>
    </div>

    <span v-show="isInvalid" class="schedule__error">{{ $t("schedule.days.error") }}</span>
  </div>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import { ShortDayNames } from "@/types/DateTypes";
import { SHORT_DAY_NAMES } from "@/constants/date.constants";

export type DayProps = { checked: boolean; isDisabled?: boolean };
// type of v-model
export type ScheduleDaysValue = { [key in ShortDayNames]: DayProps };

export interface ScheduleDaysProps {
  modelValue: ScheduleDaysValue;
  isInvalid?: boolean;
  disabled?: boolean;
  selectAll?: boolean;
}

const props = defineProps<ScheduleDaysProps>();
const emits = defineEmits<{
  (event: "update:modelValue", value: ScheduleDaysValue): void;
}>();

const days = useVModel(props, "modelValue", emits, {
  deep: true,
  passive: true,
});

const daysWithKeys: Record<ShortDayNames, string> = {
  Mon: "common.monday.short",
  Tue: "common.tuesday.short",
  Wed: "common.wednesday.short",
  Thu: "common.thursday.short",
  Fri: "common.friday.short",
  Sat: "common.saturday.short",
  Sun: "common.sunday.short",
};

function handleChange(name: ShortDayNames) {
  days.value[name].checked = !days.value[name].checked;
}

const selectAllStatus = computed(() => {
  const enabledDays = Object.values(days.value).filter((d) => !d.isDisabled);
  if (enabledDays.length === 0) {
    return "unchecked";
  }
  if (enabledDays.every((d) => d.checked === true)) {
    return "checked";
  }
  if (enabledDays.find((d) => d.checked)) {
    return "indeterminate";
  }
  return "unchecked";
});

function handleSelectAll() {
  const allCheckedDays = Object.values(days.value)
    .filter((d) => !d.isDisabled)
    .every((d) => d.checked);

  for (const day of SHORT_DAY_NAMES) {
    if (!days.value[day].isDisabled) {
      days.value[day].checked = !allCheckedDays;
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.schedule {
  position: relative;
  display: flex;
  align-items: center;
  gap: rem(24);
  border: var(--border-default);
  border-radius: var(--border-radius-default);
  padding: rem(8) rem(16);

  &__day {
    display: flex;
  }

  &__label {
    @include font-regular(14);

    margin-left: rem(8);
    margin-bottom: rem(-2);
  }

  &__error {
    position: absolute;
    left: 0;
    bottom: -18px;
    color: var(--color-error-110);
    @include font-regular(12);
  }

  &[invalid] {
    border-color: var(--color-error-100);
  }
}
</style>

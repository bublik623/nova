<template>
  <div ref="component" class="NovaInputDate">
    <DateInput
      :id="`${id}-from`"
      :value="modelValue?.from"
      :placeholder="placeholder?.from || 'dd/mm/yyyy'"
      :label="hideLabel ? undefined : 'From'"
      class="NovaInputDate__input"
      :selecting-date="(showCalendar && selectingDate === 'FROM') || null"
      :data-testid="`${id}-input-date-input`"
      :is-invalid="isInvalid"
      :readonly="readonly"
      @click="!readonly ? ((showCalendar = !showCalendar), (selectingDate = 'FROM')) : ''"
      @click:clear="handleInputClear('from')"
    />

    <template v-if="singleDateSelector">
      <div v-if="showCalendar" ref="floating" class="NovaInputDate__calendar-modal" :style="floatingStyles">
        <NovaDatePicker
          v-if="showCalendar"
          :can-select-all-dates="canSelectAllDates"
          :dates="[modelValue?.from ?? new Date()]"
          :max-months-timespan="maxMonthsTimespan"
          mode="single"
          :data-testid="`${id}-input-date-calendar`"
          style="transform-origin: top left"
          @select:dates="$emit('update:modelValue', { from: $event[0] })"
        />
      </div>
    </template>

    <template v-else>
      <div>
        <NovaIcon name="arrow-right" />
      </div>
      <DateInput
        :id="`${id}-to`"
        :can-select-all-dates="canSelectAllDates"
        :value="modelValue?.to"
        :placeholder="placeholder?.to || 'dd/mm/yyyy'"
        :label="hideLabel ? undefined : 'To'"
        class="NovaInputDate__input"
        :selecting-date="(showCalendar && selectingDate === 'TO') || null"
        :data-testid="`${id}-input-date-input`"
        :is-invalid="isInvalid"
        :readonly="readonly"
        @click="!readonly ? ((showCalendar = !showCalendar), (selectingDate = 'TO')) : ''"
        @click:clear="handleInputClear('to')"
      />

      <div v-if="showCalendar" ref="floating" class="NovaInputDate__calendar-modal" :style="floatingStyles">
        <NovaDatePicker
          :can-select-all-dates="canSelectAllDates"
          :dates="selectedDateRange"
          mode="range"
          :selecting-date="selectingDate"
          :max-months-timespan="maxMonthsTimespan"
          :data-testid="`${id}-input-date-calendar`"
          style="transform-origin: top"
          @select:dates="handleDateRangeUpdate"
          @update:selecting-date="selectingDate = $event"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import NovaDatePicker from "../NovaDatePicker/NovaDatePicker.vue";
import DateInput from "./components/DateInput.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { useDetectClickOutside } from "@/composables/useDetectClickOutside";
import { DateRange } from "@/types/DateTypes";
import { getDates } from "@/utils/date-utils";
import { autoPlacement, useFloating } from "@floating-ui/vue";

export interface Props {
  id: string;
  modelValue?: DateRange;
  singleDateSelector?: boolean;
  hideLabel?: boolean;
  maxMonthsTimespan?: number;
  isInvalid?: boolean;
  readonly?: boolean;
  placeholder?: {
    from?: string;
    to?: string;
  };
  // Remove all the date selection limitations
  canSelectAllDates?: boolean;
}

interface Events {
  (e: "update:modelValue", val: DateRange): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();

const selectedDateRange = computed<Date[]>(() =>
  props.modelValue?.from && props.modelValue.to ? getDates(props.modelValue?.from, props.modelValue.to) : []
);
const selectingDate = ref<"FROM" | "TO">("FROM");

const showCalendar = ref(false);
const component = ref<Element | null>(null);
const floating = ref(null);

const { floatingStyles } = useFloating(component, floating, {
  middleware: [
    autoPlacement({
      allowedPlacements: ["bottom-start", "bottom-end"],
    }),
  ],
  open: showCalendar.value,
});

useDetectClickOutside(component, () => {
  showCalendar.value = false;
});

function handleInputClear(type: "from" | "to") {
  switch (type) {
    case "from":
      emit("update:modelValue", { to: props.modelValue?.to });
      selectingDate.value = "FROM";
      break;
    case "to":
      emit("update:modelValue", { from: props.modelValue?.from });
      selectingDate.value = "TO";
      break;
  }
}

function handleDateRangeUpdate(dates: Date[]) {
  let dateRange: DateRange = {};

  if (dates.length > 0) {
    dateRange = { from: dates[0], to: dates[dates.length - 1] };
  }

  emit("update:modelValue", dateRange);
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.NovaInputDate {
  position: relative;
  display: flex;
  align-items: center;
  gap: rem(5);

  &__input {
    width: 100%;
    max-width: rem(145);
  }

  &__calendar-modal {
    padding-top: rem(4);
    z-index: var(--z-index-dropdown);
  }
}
</style>

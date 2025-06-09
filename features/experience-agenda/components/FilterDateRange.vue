<template>
  <div class="FilterDateRange">
    <p class="FilterDateRange__description">
      {{ $t("experience.agenda.filters.date.range.input.description-1") }}
    </p>
    <NovaInputDate
      id="agenda-date-filter-input"
      class="mt-8"
      :max-months-timespan="2"
      :model-value="range"
      @update:model-value="$emit('update:selectedRange', $event)"
    />

    <p class="FilterDateRange__description mt-6">
      {{ $t("experience.agenda.filters.date.range.input.description-2") }}
    </p>
    <ScheduleDays v-model="scheduleDays" class="mb-2" />

    <NovaButton
      variant="outline"
      class="mt-6"
      :disabled="!range.from && !range.to"
      data-testid="agenda-date-filter-clear"
      @click="handleClear"
    >
      <NovaIcon name="clear" class="mr-2" />{{ $t("experience.agenda.filters.date.clear") }}</NovaButton
    >
  </div>
</template>

<script lang="ts" setup>
import { DateRange } from "@/types/DateTypes";
import ScheduleDays from "@/features/experience-shared/components/ScheduleDays.vue";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaInputDate from "@/ui-kit/NovaInputDate/NovaInputDate.vue";
import { useScheduleDays } from "@/features/experience-shared/composables/useScheduleDays";
import { getDates } from "@/utils/date-utils";

export interface Props {
  range: DateRange;
  excludedDates: Date[];
}

export interface Events {
  (e: "update:selectedRange", value: DateRange): void;
  (e: "update:excludedDates", value: Date[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();

const scheduleDays = useScheduleDays(toRef(props, "range"), handleScheduleDaysUpdate);

function handleScheduleDaysUpdate() {
  if (props.range.from && props.range.to) {
    const dates = getDates(props.range.from, props.range.to);

    const excludedDays = Object.values(scheduleDays.value).reduce<number[]>((res, current, idx) => {
      if (!current.checked) {
        res.push(idx === 6 ? 0 : idx + 1);
      }
      return res;
    }, []);

    emit(
      "update:excludedDates",
      dates.filter((d) => excludedDays.includes(d.getDay()))
    );
  }
}

function handleClear() {
  emit("update:selectedRange", { from: undefined, to: undefined });
  emit("update:excludedDates", []);
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.FilterDateRange {
  max-width: rem(600);
  padding: rem(15);
  border: var(--border-default);
  border-radius: var(--border-radius-default);

  &__description {
    margin-bottom: rem(10);
    @include font-semibold(14);
  }
}
</style>

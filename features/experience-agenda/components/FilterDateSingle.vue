<template>
  <div class="FilterDateSingle">
    <NovaDatePicker :dates="dates" mode="multiple" @select:dates="$emit('update:dates', $event)" />

    <div>
      <p class="FilterDateSingle__title">
        {{ $t("experience.agenda.filters.date.single.title") }}
      </p>
      <p class="FilterDateSingle__description">
        {{ $t("experience.agenda.filters.date.single.description") }}
      </p>

      <template v-if="dates.length === 0">
        <span class="FilterDateSingle__empty">{{ $t("experience.agenda.filters.date.single.empty") }}</span>
      </template>
      <div v-else class="FilterDateSingle__dates">
        <NovaChip
          v-for="date in dates"
          :key="date.toString()"
          data-testid="agenda-date-filter-date-chip"
          @click:close="handleRemoveDate(date)"
          >{{ format(date, DATE_FORMAT_SHORT) }}</NovaChip
        >
      </div>

      <NovaButton
        variant="outline"
        size="sm"
        class="mt-6"
        data-testid="agenda-date-filter-clear"
        :disabled="dates.length === 0"
        @click="handleClear"
      >
        <NovaIcon name="clear" class="mr-2" />{{ $t("experience.agenda.filters.date.clear") }}</NovaButton
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import { format } from "date-fns";
import { DATE_FORMAT_SHORT } from "@/constants/date.constants";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import NovaChip from "@/ui-kit/NovaChip/NovaChip.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaDatePicker from "@/ui-kit/NovaDatePicker/NovaDatePicker.vue";

export interface Props {
  dates: Date[];
}

export interface Events {
  (e: "update:dates", value: Date[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();

function handleRemoveDate(date: Date) {
  emit(
    "update:dates",
    props.dates.filter((d) => d !== date)
  );
}

function handleClear() {
  emit("update:dates", []);
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.FilterDateSingle {
  max-width: rem(700);
  display: flex;
  gap: rem(30);

  &__title {
    margin-bottom: rem(5);
    margin-top: rem(15);
    @include font-semibold(14);
  }

  &__description {
    color: var(--color-text-90);
    @include font-regular(12);
  }

  &__empty {
    display: block;
    margin: rem(24) 0;
    font-style: italic;
    @include font-regular(14);
  }

  &__dates {
    max-height: rem(200);
    overflow-y: scroll;
    margin: rem(20) 0;
    display: flex;
    flex-wrap: wrap;
    gap: rem(15);
  }
}
</style>

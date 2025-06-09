<template>
  <button
    class="DateCard"
    :disabled="unavailable"
    :other-month="isDifferentMonth || null"
    :in-range="(!isStartDate && !isEndDate && isInRange) || null"
    :range-start="isStartDate || null"
    :range-end="isEndDate || null"
  >
    <div
      class="DateCard__content"
      :disabled="unavailable || null"
      :selected="isSelected || isStartDate || isEndDate || null"
    >
      {{ date.getDate() }}
    </div>
  </button>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { compareDatesWithoutTime } from "@/utils/date-utils";

interface Props {
  date: Date;
  datePreview: Date;
  isSelected: boolean;
  range?: Date[];
  unavailable?: boolean;
}

const props = defineProps<Props>();

const isDifferentMonth = computed(() => {
  return (
    props.datePreview.getMonth() !== props.date.getMonth() ||
    props.datePreview.getFullYear() !== props.date.getFullYear()
  );
});

const isInRange = computed(() => {
  if (!props.range || props.range.length <= 1) {
    return false;
  }

  const startDate = props.range[0];
  const endDate = props.range[props.range.length - 1];

  if (!startDate || !endDate) {
    return false;
  }

  return props.date >= startDate && endDate >= props.date;
});

const isStartDate = computed(
  () =>
    props.range &&
    props.range[0] &&
    props.range[props.range.length - 1] !== props.range[0] &&
    compareDatesWithoutTime(props.range[0], props.date)
);

const isEndDate = computed(
  () =>
    props.range &&
    props.range[props.range.length - 1] &&
    props.range[props.range.length - 1] !== props.range[0] &&
    compareDatesWithoutTime(props.range[props.range.length - 1], props.date)
);
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.DateCard {
  cursor: pointer;
  border: none;
  background-color: transparent;
  padding: 0;
  height: rem(48);
  width: rem(48);
  transition: all 0.2s;

  &__content {
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.1s;
    @include font-regular(14);

    &:hover:not([disabled]) {
      background-color: var(--color-primary-10);
    }

    &[selected] {
      background-color: var(--color-primary-100);
      color: var(--color-white);

      &:hover {
        background-color: var(--color-primary-110);
      }
    }
  }

  &:disabled {
    cursor: not-allowed;
    color: var(--color-text-80);
    text-decoration: line-through;
  }

  &[other-month] {
    color: var(--color-text-70);
  }

  &[in-range] {
    background-color: var(--color-primary-10);
  }

  &[range-start] {
    background: linear-gradient(90deg, transparent 50%, var(--color-primary-10) 50%, var(--color-primary-10) 100%);
  }

  &[range-end] {
    background: linear-gradient(-90deg, transparent 50%, var(--color-primary-10) 50%, var(--color-primary-10) 100%);
  }
}
</style>

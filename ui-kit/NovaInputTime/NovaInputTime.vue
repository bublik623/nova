<template>
  <div class="InputTime">
    <InputTimeDropdown
      :id="`${id}-hours`"
      :dropdown-options="hourOptions"
      :model-value="parsedTime.hours"
      :is-invalid="isInvalid"
      :disabled="disabled"
      @update:model-value="
        $emit('update:modelValue', `${$event}:${parsedTime.minutes || '00'}:${parsedTime.seconds || '00'}`)
      "
    />
    :
    <InputTimeDropdown
      :id="`${id}-minutes`"
      :dropdown-options="minutesOptions"
      :model-value="parsedTime.minutes"
      :is-invalid="isInvalid"
      :disabled="disabled"
      @update:model-value="
        $emit('update:modelValue', `${parsedTime.hours || '00'}:${$event}:${parsedTime.seconds || '00'}`)
      "
    />
  </div>
</template>

<script lang="ts" setup>
import InputTimeDropdown from "./components/InputTimeDropdown.vue";

export interface Props {
  id: string;
  modelValue?: string;
  isInvalid?: boolean;
  disabled?: boolean;
}

interface Events {
  (e: "update:modelValue", value: string): void;
}

const props = defineProps<Props>();
defineEmits<Events>();

// Data handling
const parsedTime = computed(() => {
  if (!props.modelValue) {
    return { hours: "", minutes: "", seconds: "" };
  }

  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
  if (!timeRegex.test(props.modelValue)) {
    throw new Error("Invalid format! The time string should have HH:mm:ss format");
  }

  const [hours, minutes, seconds] = props.modelValue.split(":");
  return { hours, minutes, seconds };
});

// Dropdowns
const hourOptions = Array.from(Array(24).keys(), (h) => {
  const paddedValue = getPaddedString(h);
  return { label: paddedValue, value: paddedValue };
});
const minutesOptions = Array.from(Array(60).keys(), (m) => {
  const paddedValue = getPaddedString(m);
  return { label: paddedValue, value: paddedValue };
});

// Utils
function getPaddedString(num: number, maxLen = 2) {
  return num.toString().padStart(maxLen, "0");
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.InputTime {
  display: flex;
  align-items: center;
  gap: rem(7);
  @include font-regular(14);

  &__input {
    --border-color: var(--color-grey-100);

    width: rem(22);
    height: rem(30);
    padding: 0 rem(7);
    border: var(--border-default);
    border-color: var(--border-color);
    border-radius: var(--border-radius-sm);
    background-color: white;
    outline: none;
    color: var(--color-text-100);
    @include font-regular(14);

    &::placeholder {
      font-style: italic;
      color: var(--color-text-70);
    }

    &:hover,
    &:focus-within {
      border-color: var(--color-primary-100);
    }

    &:disabled {
      cursor: not-allowed;
      background: #f9f9fb;
      color: var(--color-text-70);

      &:hover:not([data-invalid]) {
        border-color: var(--color-grey-100);
      }
    }

    /* Chrome, Safari, Edge, Opera */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      appearance: none;
      margin: 0;
    }

    /* Firefox */
    &[type="number"] {
      appearance: textfield;
    }

    &[theme="error"] {
      --border-color: var(--color-error-100);
    }
  }
}
</style>

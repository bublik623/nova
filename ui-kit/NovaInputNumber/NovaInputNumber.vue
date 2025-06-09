<template>
  <div v-if="readonly" class="InputNumber__readonly" :data-testid="`${id}-input-number-readonly`">{{ modelValue }}</div>
  <input
    v-else
    :id="id"
    type="number"
    class="InputNumber"
    :theme="(error ? 'error' : theme) || null"
    :data-testid="`${id}-input-number`"
    :value="modelValue"
    :placeholder="placeholder ?? '0'"
    :disabled="disabled"
    :min="minValue"
    :max="maxValue"
    :step="step"
    :data-invalid="isInvalid === false ? undefined : true"
    @input="handleInput"
  />
</template>

<script lang="ts" setup>
export interface Props {
  id: string;
  modelValue?: number;
  minValue: number;
  maxValue?: number;
  placeholder?: string;
  disabled?: boolean;
  step?: string;
  isInvalid?: boolean;
  error?: string;
  theme?: "success" | "error" | "warning" | "default";
  readonly?: boolean;
}

interface Events {
  (e: "update:modelValue", value: number): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const handleInput = (event: Event) => {
  if (event.target) {
    let parsedValue;
    const rawValue = (event.target as HTMLInputElement).value;

    if (props.step) {
      parsedValue = parseFloat(rawValue);
    } else {
      parsedValue = parseInt(rawValue, 10);
    }

    if (Number.isNaN(parsedValue)) {
      return;
    }

    const clampedValue = Math.min(props.maxValue ?? parsedValue, Math.max(props.minValue, parsedValue));

    emits("update:modelValue", clampedValue);
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.InputNumber {
  --border-color: var(--color-grey-100);

  width: rem(32);
  height: rem(30);
  padding: 0 rem(7);
  border: var(--border-default);
  border-color: var(--border-color);
  border-radius: var(--border-radius-sm);
  background-color: white;
  outline: none;
  color: var(--color-text-100);
  @include font-regular(14);

  &__readonly {
    @include font-regular(14);
  }

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

  &[data-invalid] {
    border-color: var(--color-error-100);
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
</style>

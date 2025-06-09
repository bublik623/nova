<template>
  <label :for="id" class="NovaInputRadio__label" :disabled="disabled || null">
    <input
      :id="id"
      ref="inputEl"
      type="radio"
      :name="name"
      :disabled="disabled"
      class="NovaInputRadio__input"
      :data-testid="`input-radio-${option.value}`"
      :checked="checked"
      @change="handleInput(option)"
    />
    <slot>{{ option.label }}</slot>
  </label>
</template>

<script lang="ts" setup>
import { toKebabCase } from "@/utils/to-kebab-case";

export interface RadioOption {
  label: string;
  value: unknown;
}

export interface Props {
  option: RadioOption;
  checked?: boolean;
  name?: string;
  disabled?: boolean;
}

interface Events {
  (e: "input", value: unknown): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Events>();

const id = computed(() => `${props.name ?? ""}${toKebabCase(props.option.label)}`);

const inputEl = ref<HTMLInputElement>();

function handleInput(option: RadioOption) {
  emit("input", option.value);
  if (!inputEl.value) {
    return;
  }
  if (props.checked === false) {
    inputEl.value.checked = false;
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.NovaInputRadio {
  &__label {
    display: flex;
    align-items: center;
    cursor: pointer;

    @include font-semibold(14);

    &[disabled] {
      cursor: not-allowed;
      color: var(--color-text-70);
    }
  }

  &__input {
    --background-color: white;
    --border-color: var(--color-grey-100);

    cursor: pointer;
    position: relative;
    appearance: none;
    outline: none;
    margin: 0 rem(8) 0 0;
    height: rem(16);
    min-width: rem(16);
    border: var(--border-default);
    border-color: var(--border-color);
    border-radius: 50%;
    background-color: var(--background-color);

    &:disabled {
      cursor: not-allowed;

      --background-color: var(--color-grey-70);
    }

    &:hover:not(:disabled) {
      --border-color: var(--color-primary-100);
    }

    /* stylelint-disable-next-line no-descending-specificity */
    &:checked {
      --border-color: var(--color-primary-100);

      &::before {
        content: "";
        border-radius: 50%;
        width: rem(6);
        height: rem(6);
        position: absolute;
        top: rem(4);
        right: rem(4);
        background-color: var(--border-color);
      }

      &:disabled {
        cursor: not-allowed;

        --border-color: var(--color-grey-100);
      }

      &:hover:not(:disabled) {
        --border-color: var(--color-primary-110);
      }
    }
  }
}
</style>

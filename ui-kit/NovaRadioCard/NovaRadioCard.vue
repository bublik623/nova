<template>
  <label
    :for="toKebabCase(title)"
    class="RadioCard"
    :checked="checked || null"
    :disabled="disabled || null"
    :data-testid="`radio-card-${value}`"
  >
    <span class="RadioCard__title">
      <NovaInputRadio
        class="RadioCard__radio"
        :checked="checked"
        :option="{ value: value, label: title }"
        :disabled="disabled"
        @input="(optionValue) => $emit('input', String(optionValue))"
      ></NovaInputRadio>
    </span>
    <div class="RadioCard__description">
      <slot name="description" />
    </div>
  </label>
</template>

<script setup lang="ts">
import NovaInputRadio from "@/ui-kit/NovaInputRadio/NovaInputRadio.vue";
import { toKebabCase } from "@/utils/to-kebab-case";

export interface Props {
  checked?: boolean;
  title: string;
  value: string;
  disabled?: boolean;
}
interface Events {
  (e: "input", value: string): void;
}
defineEmits<Events>();

defineProps<Props>();
</script>
<style lang="scss">
@import "@/assets/scss/utilities";

.RadioCard {
  cursor: pointer;
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-default);
  display: block;
  padding: rem(12);
  width: 100%;

  &__radio {
    input[type="radio"] {
      margin-right: rem(16);
    }
  }

  &:hover:not([disabled]) {
    border-color: var(--color-primary-100);
  }

  &[checked]:hover:not([disabled]) {
    border-color: var(--color-primary-110);
  }

  &__title {
    display: flex;
    color: var(--color-text-100);
    @include font-semibold(12);

    p {
      margin-left: rem(10);
    }
  }

  &__description {
    margin-left: rem(32);
    margin-top: rem(4);
    color: var(--color-text-90);
    @include font-regular(14);

    ul {
      list-style-type: disc;
      list-style-position: inside;
      margin-left: rem(10);
    }
  }

  &[disabled] {
    background: var(--color-grey-70);
    cursor: not-allowed;

    .RadioCard__description {
      color: var(--color-text-70);
    }
  }
}
</style>

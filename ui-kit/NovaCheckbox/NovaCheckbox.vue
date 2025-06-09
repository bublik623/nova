<template>
  <span class="main-container">
    <div data-testid="nova-checkbox-container" class="checkbox-container" :size="size">
      <nova-icon
        v-if="status === 'checked'"
        data-testid="nova-checkbox-check"
        class="checkbox-container__icon"
        name="check"
        :disabled="disabled"
        :size="size === 'lg' ? 12.5 : 10"
      />
      <nova-icon
        v-if="status === 'indeterminate'"
        data-testid="nova-checkbox-minus"
        class="checkbox-container__icon"
        name="minus"
        :disabled="disabled"
        :size="size === 'lg' ? 11.5 : 9.25"
      />
      <input
        :id="`checkbox-${value}`"
        :aria-checked="status === 'checked'"
        :value="value"
        :class="{
          'checkbox-container__checkbox': true,
          'checkbox-container__checkbox-checked': status === 'checked',
          'checkbox-container__checkbox-indeterminate': status === 'indeterminate',
        }"
        type="checkbox"
        :disabled="disabled"
        :indeterminate="status === 'indeterminate'"
        v-bind="inputProps"
        @click.prevent="(e) => checking(e)"
        @keydown.space.prevent="(e) => checking(e)"
      />
    </div>
    <label v-if="label" data-testid="nova-checkbox-label" class="label" :size="size" :for="`checkbox-${value}`"
      ><span class="label__text" :disabled="disabled || null">{{ label }}</span>
      <div v-if="description" class="label__description">{{ description }}</div>
    </label>
  </span>
</template>

<script setup lang="ts" generic="T">
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { InputHTMLAttributes } from "vue";

export type NovaCheckBoxStatus = "checked" | "unchecked" | "indeterminate";

export interface Props<T> {
  size?: "sm" | "lg";
  disabled?: boolean;
  label?: null | string;
  description?: null | string;
  status: "checked" | "unchecked" | "indeterminate";
  value: T;
  inputProps?: InputHTMLAttributes;
}

function checking(e: Event) {
  e.stopPropagation();
  emits("update:status", props.value);
}

const props = withDefaults(defineProps<Props<T>>(), {
  disabled: false,
  label: null,
  description: null,
  size: "sm",
  inputProps: undefined,
});

interface Events {
  (e: "update:status", value: T): void;
}

const emits = defineEmits<Events>();
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.main-container {
  display: flex;

  .label {
    margin-left: rem(8px);

    &__text {
      color: var(--color-text-100);
      cursor: pointer;
      @include font-regular(14);

      &[disabled] {
        color: var(--color-text-70);
      }
    }

    &__description {
      color: var(--color-text-80);
      @include font-regular(12);
    }

    &[size="lg"] {
      .label__text {
        font-size: rem(16px);
      }

      .label__description {
        font-size: rem(12px);
      }
    }
  }

  .checkbox-container {
    --background-color: white;
    --border-color: var(--color-grey-100);

    width: rem(16px);
    height: rem(16px);
    position: relative;

    &__checkbox {
      cursor: pointer;
      appearance: none;
      height: rem(16px);
      width: rem(16px);
      margin: 0;
      border-radius: 4px;
      border: var(--border-default);
      border-color: var(--border-color);
      background-color: var(--background-color);

      &:disabled {
        cursor: not-allowed;

        --background-color: var(--color-grey-70);
        --border-color: var(--color-grey-100);
      }

      &:hover:not(:disabled),
      &:focus-visible:not(:disabled) {
        --border-color: var(--color-primary-100);
      }

      &-checked,
      &-indeterminate {
        --background-color: var(--color-primary-100);
        --border-color: var(--color-primary-100);

        &:disabled {
          --background-color: var(--color-grey-100);
        }

        &:hover:not(:disabled) {
          --background-color: var(--color-primary-110);
          --border-color: var(--color-primary-110);
        }
      }

      &[size="lg"] {
        width: rem(20);
        height: rem(20);

        .checkbox-container__checkbox {
          width: rem(20);
          height: rem(20);
        }
      }

      /* stylelint-disable-next-line no-descending-specificity */
    }

    &__icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      color: var(--color-white);

      &[disabled="true"] {
        color: white;
      }
    }
  }
}
</style>

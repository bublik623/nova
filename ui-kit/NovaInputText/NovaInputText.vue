<template>
  <p
    v-if="!!readonly"
    class="InputText__readonly"
    :data-testid="`${id}-input-text-readonly`"
    :empty="(!modelValue && !$slots.default) || null"
  >
    <slot>
      <span>{{ modelValue ? modelValue : readonlyPlaceholder }}</span>
    </slot>
    <span v-if="showMetrics" class="InputText__readonly__metrics" :data-testid="`${id}-input-text-metrics`">
      <NovaTextMetrics
        :words-count="wordsCount"
        :characters-count="charactersCount"
        :max-characters="Number(inputProps?.maxlength?.valueOf())"
      ></NovaTextMetrics>
    </span>
  </p>

  <span v-else :style="{ width: '100%' }">
    <label v-if="label" :data-testid="`${id}-input-text-label`" :for="`${id}-label`" class="InputText__label">
      {{ label }}
    </label>
    <div
      class="InputText"
      :disabled="disabled || null"
      :theme="(error ? 'error' : theme) || null"
      :size="size"
      :data-testid="`${id}-input-text-container`"
      :data-invalid="isInvalid === false ? undefined : true"
    >
      <nova-icon v-if="leftIcon" name="search" :size="18" />
      <input
        :id="id"
        type="text"
        class="InputText__input"
        :data-testid="`${id}-input-text`"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        v-bind="inputProps"
        @input="handleInput"
        @click="emits('click')"
      />
      <span v-if="error" class="InputText__error-msg" :data-testid="`${id}-input-text-error`">{{ error }}</span>
      <span v-if="showMetrics" class="InputText__metrics" :data-testid="`${id}-input-text-metrics`">
        <NovaTextMetrics
          :words-count="wordsCount"
          :characters-count="charactersCount"
          :max-characters="Number(inputProps?.maxlength?.valueOf())"
        ></NovaTextMetrics>
      </span>
      <button
        v-if="modelValue && !disabled"
        class="InputText__clear-btn"
        :data-testid="`${id}-input-text-clear-btn`"
        v-bind="buttonClearProps"
        @click="handleClear"
      >
        <NovaIcon name="close" :size="8" />
      </button>
    </div>
  </span>
</template>

<script lang="ts" setup>
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaTextMetrics from "../NovaTextMetrics/NovaTextMetrics.vue";
import { InputHTMLAttributes } from "vue";

export interface Props {
  id?: string;
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  leftIcon?: "search";
  theme?: "success" | "error" | "warning" | "default";
  error?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  isInvalid?: boolean;
  readonly?: boolean;
  readonlyPlaceholder?: string;
  buttonClearProps?: Record<string, unknown>;
  inputProps?: InputHTMLAttributes;
  showMetrics?: boolean;
}

interface Events {
  (e: "update:modelValue", value: string): void;
  (e: "click"): void;
  (e: "clear"): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Insert text",
  readonlyPlaceholder: "This field is empty...",
});
const emits = defineEmits<Events>();

const wordsCount = computed(() => {
  return (
    props.modelValue
      ?.trim()
      .split(" ")
      .filter((token) => token.length > 0).length ?? 0
  );
});

const charactersCount = computed(() => {
  return props.modelValue?.length ?? 0;
});

const handleInput = (event: Event) => {
  if (event.target) {
    const { value } = event.target as HTMLInputElement;
    emits("update:modelValue", value);
  }
};

const handleClear = () => {
  emits("update:modelValue", "");
  emits("clear");
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.InputText {
  --border-color: var(--color-grey-100);

  width: 100%;
  padding: 0 rem(5);
  border: var(--border-default);
  border-color: var(--border-color);
  border-radius: var(--border-radius-default);
  position: relative;
  display: flex;
  align-items: center;
  background-color: white;

  &[data-invalid] {
    border-color: var(--color-error-100);
  }

  & > svg {
    flex-shrink: 0;
  }

  &__input {
    margin-left: rem(5);
    height: rem(28);
    border: none;
    outline: none;
    width: 100%;
    background-color: transparent;
    color: var(--color-text-100);

    @include font-regular(14);

    &::placeholder {
      font-style: italic;
      color: var(--color-text-70);
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &:hover {
    --border-color: var(--color-text-80);
  }

  &:active {
    --border-color: var(--color-primary-100);
  }

  &:focus-within {
    --border-color: var(--color-primary-100);
  }

  &[disabled] {
    background: #f9f9fb;

    &:hover {
      border-color: var(--color-grey-100);
    }

    & input {
      color: var(--color-text-70);
    }
  }

  &[theme="error"] {
    --border-color: var(--color-error-100);
  }

  &[theme="success"] {
    --border-color: var(--color-success-100);
  }

  &[theme="warning"] {
    --border-color: var(--color-warning-100);
  }

  &__error-msg {
    color: var(--color-error-110);

    @include font-semibold(12);

    position: absolute;
    top: 115%;
    left: 0;
  }

  &__metrics {
    position: absolute;
    top: 115%;
    right: 0;
  }

  &__label {
    position: relative;
    bottom: 4px;

    @include font-regular(12);

    color: var(--color-text-100);
  }

  &__clear-btn {
    background: var(--color-neutral-40);
    border: none;
    border-radius: 100%;
    cursor: pointer;
    padding: rem(8) rem(8);
    position: relative;
    margin-right: 5px;

    & > svg {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  &__error-icon {
    color: var(--color-error-100);
    padding: rem(5) rem(3);
  }

  &__success-icon {
    color: var(--color-success-100);
    padding: rem(5) rem(3);
  }

  &[size="md"] {
    padding: 1px rem(7);
  }

  &[size="lg"] {
    padding: 5px rem(7);
  }

  &__readonly {
    @include font-regular(14);

    &[empty] {
      font-style: italic;
      color: var(--color-text-70);
    }
  }
}
</style>

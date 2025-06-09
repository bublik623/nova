<template>
  <label v-if="label" :data-testid="`${id}-input-text-label`" :for="`${id}-label`" class="InputText__label">{{
    label
  }}</label>
  <div
    class="InputText"
    :disabled="disabled || null"
    :theme="(error ? 'error' : theme) || null"
    :size="size"
    :data-testid="`${id}-input-text-container`"
  >
    <textarea
      :id="id"
      type="text"
      class="InputText__input"
      :data-testid="`${id}-input-text`"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows || 5"
      @input="handleInput"
    />
    <span v-if="error" class="InputText__error-msg" :data-testid="`${id}-input-text-error`">{{ error }}</span>
    <button
      v-if="modelValue && !disabled"
      class="InputText__clear-btn"
      :data-testid="`${id}-input-text-clear-btn`"
      @click="handleClear"
    >
      <NovaIcon name="close" :size="12" />
    </button>

    <div v-if="error || theme === 'error'" class="InputText__error-icon" data-testid="input-text-error-icon">
      <NovaIcon name="alert" :size="12" />
    </div>

    <div v-else-if="theme === 'success'" class="InputText__success-icon" data-testid="input-text-success-icon">
      <NovaIcon name="check" :size="12" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";

export interface Props {
  id: string;
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  theme?: "success" | "error" | "warning" | "default";
  error?: string;
  label?: string;
  size?: "sm" | "lg";
  rows?: number;
}

interface Events {
  (e: "update:modelValue", value: string): void;
}

defineProps<Props>();
const emits = defineEmits<Events>();

const handleInput = (event: Event) => {
  if (event.target) {
    const { value } = event.target as HTMLInputElement;
    emits("update:modelValue", value);
  }
};

const handleClear = () => {
  emits("update:modelValue", "");
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

  & > svg {
    flex-shrink: 0;
  }

  &__input {
    margin-left: rem(5);
    border: none;
    outline: none;
    width: 100%;
    background-color: transparent;
    color: var(--color-text-100);
    resize: none;

    @include font-regular(14);

    &::placeholder {
      font-style: italic;
      color: var(--color-text-70);
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &:hover,
  &:focus-within {
    --border-color: var(--color-primary-100);
  }

  &[disabled] {
    background: #f9f9fb;

    &:hover {
      border-color: var(--color-grey-100);
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
    color: var(--color-error-100);

    @include font-semibold(12);

    position: absolute;
    top: calc(100% + 3px);
    right: 5px;
  }

  &__label {
    position: relative;
    bottom: 5px;

    @include font-regular(12);

    color: var(--color-text-90);
  }

  &__clear-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: rem(5) rem(3);
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

  &[size="lg"] {
    padding: 5px rem(7);
  }
}
</style>

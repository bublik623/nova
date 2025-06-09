<template>
  <button
    class="NovaSwitch"
    role="switch"
    :aria-checked="modelValue"
    :aria-disabled="disabled"
    :disabled="disabled"
    @click="$emit('update:modelValue', !modelValue)"
  />
</template>

<script lang="ts" setup>
export interface Props {
  modelValue: boolean;
  disabled?: boolean;
}
interface Events {
  (e: "update:modelValue", value: boolean): void;
}

defineProps<Props>();
defineEmits<Events>();
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.NovaSwitch {
  --background-color: var(--color-neutral-30);
  --border-color: var(--color-neutral-60);

  cursor: pointer;
  position: relative;
  width: rem(32);
  height: rem(16);
  border: none;
  outline: 1px solid var(--border-color);
  background-color: var(--background-color);
  border-radius: var(--border-radius-md);
  transition: background-color 100ms ease-out;
  will-change: background-color;

  @include font-semibold(12);

  &[aria-checked="true"]:not(:disabled) {
    --background-color: var(--color-primary-100);
    --border-color: var(--color-primary-100);
    --circle-background-color: white;
  }

  &::after {
    content: "";
    display: block;
    width: rem(16);
    height: rem(16);
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 50%;
    outline: 1px solid var(--border-color);
    background-color: var(--circle-background-color);
    transition: all 100ms ease-out;
    will-change: transform background-color;
  }

  &[aria-checked="true"]::after {
    transform: translateX(16px);
  }

  &[aria-checked="false"]:not(:disabled)::after {
    background-color: white;
  }

  &[aria-disabled="true"] {
    --background-color: var(--color-neutral-10);
    --circle-background-color: var(--color-neutral-10);

    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    --border-color: var(--color-text-80);
  }

  &:hover:not(:disabled):not([aria-checked="false"]) {
    --border-color: var(--color-primary-110);
    --background-color: var(--color-primary-110);
  }
}
</style>

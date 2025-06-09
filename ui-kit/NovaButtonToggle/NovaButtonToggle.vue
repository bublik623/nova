<template>
  <button
    class="NovaButtonToggle"
    role="switch"
    :aria-checked="modelValue"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span class="SlotItem" data-testid="nova-button-toggle-first-option" :class="{ 'SlotItem--active': modelValue }">
      <slot name="firstOption" />
    </span>
    <span class="SlotItem" data-testid="nova-button-toggle-second-option" :class="{ 'SlotItem--active': !modelValue }">
      <slot name="secondOption" />
    </span>
    <span
      class="SlotBackground"
      :class="{
        'SlotBackground--left': modelValue,
        'SlotBackground--right': !modelValue,
      }"
    />
  </button>
</template>

<script lang="ts" setup>
export interface Props {
  modelValue: boolean;
}
interface Events {
  (e: "update:modelValue", value: boolean): void;
}

defineProps<Props>();
defineEmits<Events>();
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.NovaButtonToggle {
  cursor: pointer;
  min-width: rem(216);
  display: grid;
  grid-template-columns: 1fr 1fr;
  position: relative;
  padding: rem(2) rem(6);
  border: rem(3px) solid var(--color-secondary-30);
  background-color: var(--color-secondary-30);
  border-radius: var(--border-radius-xl);
  @include font-regular(14);

  // Avoids the border from overlapping the background
  // as they are both transparent, they would sum up.
  background-clip: padding-box;

  .SlotItem {
    padding: rem(0) rem(4);
    height: 100%;
    white-space: nowrap;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    color: var(--color-text-90);

    &--active {
      color: var(--color-text-100);
    }
  }

  .SlotBackground {
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
    box-sizing: border-box;
    background-color: var(--color-white);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--box-shadow-light);
    transition: transform 0.1s ease-out;
    will-change: transform;

    &--left {
      transform: translateX(0%);
    }

    &--right {
      transform: translateX(100%);
    }
  }
}
</style>

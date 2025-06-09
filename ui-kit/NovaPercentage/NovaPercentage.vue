<template>
  <div class="Percentage">
    <slot></slot>
    <div class="Percentage__progress">
      <div class="Percentage__progress-bar" :style="{ width: `${percentage}%`, background: color }" />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Props {
  percentage: number;
  color: string;
}
defineProps<Props>();
</script>

<style lang="scss">
@import "@/assets/scss/utilities";

.Percentage {
  &__progress {
    height: rem(4);
    border-radius: 15px;
    background: var(--color-neutral-60);

    &-bar {
      border-radius: 15px;
      transition: width ease-in-out 0.3s;
      height: 100%;
    }
  }
}
</style>

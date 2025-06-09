<template>
  <div class="HighlightWrapper">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.HighlightWrapper {
  border: var(--border-default);
  border-radius: var(--border-radius-sm);
  width: 100%;
  padding: rem(4) 0;

  :slotted(.title) {
    margin: rem(12) rem(16);

    @include font-bold(14);
  }

  :slotted(.divider) {
    border-bottom: var(--border-default);
    margin: rem(8) 0;
  }

  :slotted(.list) {
    margin: 0 rem(16);
  }
}
</style>

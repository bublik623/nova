<template>
  <table class="SimpleTable" :aria-label="caption">
    <thead>
      <slot name="header"></slot>
    </thead>
    <tbody>
      <slot name="body"></slot>
    </tbody>
  </table>
</template>

<script setup lang="ts">
defineProps<{
  caption: string;
}>();
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.SimpleTable {
  width: 100%;

  thead {
    color: var(--color-primary-100);
    text-align: left;
    border-bottom: var(--border-default);

    @include font-regular(14);

    :deep(th) {
      padding: rem(8) rem(16);
    }
  }

  tbody {
    text-align: left;

    @include font-regular(14);

    :deep(tr):not(:last-child) {
      border-bottom: var(--border-default);
    }

    :deep(td) {
      padding: rem(8) rem(16);
    }
  }
}
</style>

<template>
  <div class="multi-select-group">
    <slot name="label">
      <div class="multi-select-header truncate" v-bind="$attrs">{{ label }}</div>
    </slot>
    <div class="multi-select-items">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string;
}>();

defineOptions({ inheritAttrs: false });
</script>

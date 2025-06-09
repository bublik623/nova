<template>
  <template v-for="(chunk, index) in chunks" :key="index">
    <span v-if="chunk.value !== '\n'" :class="{ red: chunk.removed, green: chunk.added }">{{ chunk.value }}</span>
    <br v-else />
  </template>
</template>

<script setup lang="ts">
import { diffWords } from "diff";

export interface Props {
  value: string;
  oldValue: string;
}

const props = defineProps<Props>();
const chunks = computed(() => diffWords(props.oldValue, props.value));
</script>

<style scoped lang="scss">
.red {
  background: var(--color-error-90);
  color: var(--color-error-100);
  text-decoration: line-through;
}

.green {
  background: var(--color-success-10);
  color: var(--color-success-100);
  text-decoration: underline;
}
</style>

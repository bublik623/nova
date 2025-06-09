<template>
  <div class="flex flex-row place-content-end text-text-90 metrics">
    <span data-testid="words-count">Words: {{ wordsCount }}</span>
    <span class="ml-2" data-testid="characters-count">
      Characters: {{ charactersCount
      }}<span v-if="maxCharacters" data-testid="max-characters">/{{ maxCharacters }}</span>
    </span>
  </div>
</template>
<script setup lang="ts">
export interface Props {
  wordsCount: number;
  charactersCount: number;
  maxCharacters?: number;
}

defineProps<Props>();
</script>
<style scoped lang="scss">
@import "@/assets/scss/utilities";

.metrics {
  @include font-semibold(12);
}
</style>

<template>
  <div class="text-sm italic text-text-70 font-light">
    {{ placeholder ?? $t("common.no-content") }}
  </div>
</template>

<script setup lang="ts">
interface Props {
  placeholder?: string;
}

const { $t } = useNuxtApp();

defineProps<Props>();
</script>

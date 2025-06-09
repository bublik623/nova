<template>
  <div>
    <NovaIconFlag shape="circle" :size="10" :country-code="countryCode" />
    <span class="LanguageLabel ml-1">{{ $t(`common.language.${countryCode}`) }}</span>
  </div>
</template>

<script setup lang="ts">
import NovaIconFlag from "@/ui-kit/NovaIconFlag/NovaIconFlag.vue";

interface Props {
  countryCode: string;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.LanguageLabel {
  color: var(--color-text-90);
  @include font-semibold(12);
}
</style>

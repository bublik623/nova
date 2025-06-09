<script setup lang="ts">
import NovaInputText from "@/ui-kit/NovaInputText/NovaInputText.vue";

interface Props {
  placeholder?: string;
  buttonClearProps?: Record<string, unknown>;
  inputProps?: Record<string, unknown>;
}

defineProps<Props>();

const searchQueryModel = defineModel<string>({ default: () => "" });
</script>

<template>
  <NovaInputText
    id="multi-select-search"
    v-model="searchQueryModel"
    left-icon="search"
    :placeholder="placeholder || $t('common.search')"
    :button-clear-props="buttonClearProps"
    :input-props="inputProps"
  />
</template>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

:deep(.InputText__clear-btn) {
  height: rem(16) !important;
  width: rem(16) !important;
  border-radius: 100%;
  background: var(--color-grey-90);

  svg {
    border-radius: 100%;
    height: rem(8) !important;
  }
}
</style>

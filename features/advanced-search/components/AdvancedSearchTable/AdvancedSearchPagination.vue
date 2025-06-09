<template>
  <div class="Pagination">
    <div class="Pagination__text">{{ text }}</div>
    <div class="Pagination__nav">
      <NovaPagination
        :model-value="modelValue"
        :total="itemsCount"
        :items-per-page="itemsPerPage"
        :show-edges="totPages > 7"
        :siblings="totPages > 7 ? 1 : 3"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import NovaPagination from "@/ui-kit/NovaPagination/NovaPagination.vue";

const { $t } = useNuxtApp();

interface Props {
  itemsCount: number;
  itemsPerPage: number;
  modelValue: number;
}

defineEmits<(e: "update:modelValue", value: number) => void>();
const props = defineProps<Props>();

const totPages = computed(() => Math.ceil(props.itemsCount / props.itemsPerPage));

// checking the number of experiences shown up to the current page
const displayedItemsCount = computed(() =>
  totPages.value === props.modelValue ? props.itemsCount : props.itemsPerPage * props.modelValue
);

const text = computed(() =>
  [
    $t("common.showing"),
    props.itemsPerPage * (props.modelValue - 1) + 1,
    $t("common.to"),
    displayedItemsCount.value,
    $t("common.of"),
    props.itemsCount,
    $t("common.entries"),
  ].join(" ")
);
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.Pagination {
  background-color: var(--color-white);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--color-grey-100);
  padding: rem(2) rem(12);

  &__text {
    color: var(--color-text-80);
    position: sticky;
    left: rem(12);
    @include font-semibold(12);
  }

  &__nav {
    position: sticky;
    right: rem(12);
  }
}
</style>

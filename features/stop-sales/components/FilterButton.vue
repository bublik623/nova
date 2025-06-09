<script setup lang="ts">
defineProps<{
  title: string;
  isOpen: boolean;
  selectedItemsCount: number;
  disabled?: boolean;
}>();
</script>

<template>
  <button
    class="section p-4 grid gap-1 text-left ring-1 focus:z-10"
    :class="{
      'bg-neutral-10': !isOpen && selectedItemsCount === 0,
      'bg-white': isOpen,
      'ring-neutral-60': !isOpen && selectedItemsCount === 0,
      'bg-primary-10': selectedItemsCount,
      'ring-primary-100': isOpen || selectedItemsCount > 0,
      'z-10': isOpen || selectedItemsCount > 0,
      'pointer-events-none': false,
    }"
    :disabled
    :data-disabled="disabled"
  >
    <span class="text-sm font-bold">{{ title }}</span>
    <slot>
      <span
        class="text-sm font-normal"
        :class="{
          italic: selectedItemsCount === 0,
          'text-text-70': selectedItemsCount === 0,
        }"
      >
        {{
          selectedItemsCount
            ? $t("stop_sales.filter.common.selected", { placeholders: { count: selectedItemsCount } })
            : $t("stop_sales.filter.common.select_filter")
        }}
      </span>
    </slot>
  </button>
</template>

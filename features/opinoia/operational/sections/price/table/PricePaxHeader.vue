<script setup lang="ts">
defineProps<{
  parentId: string;
}>();
</script>

<template>
  <tr class="sub-row-heading" data-testid="sub-row-heading" :data-parent-id="parentId">
    <!-- Empty cell for checkbox column -->
    <td class="border-r-0"></td>
    <!-- Empty cell for Option column -->
    <td class="border-l-0"></td>
    <td data-testid="column-pax-label" class="sub-row-title">
      {{ $t("opinoia.price-section.table.subrow.column.paxType.title") }}
    </td>
    <td data-testid="column-cost" class="sub-row-title">
      {{ $t("opinoia.price-section.table.subrow.column.cost.title") }}*
    </td>
    <td data-testid="column-initial-price" class="sub-row-title">
      {{ $t("opinoia.price-section.table.subrow.column.initialPrice.title") }}*
    </td>
    <td data-testid="column-suggested-price" class="sub-row-title">
      {{ $t("opinoia.price-section.table.subrow.column.suggestedPrice.title") }}*
    </td>
    <!-- Empty cell for the days of the week -->
    <td class="border-r-0"></td>
    <!-- Empty cell for the last column -->
    <td></td>
  </tr>
</template>

<style lang="scss">
.sub-row-title {
  @apply bg-neutral-20 text-text-90 text-xs font-semibold;
}
</style>

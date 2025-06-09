<template>
  <NovaSortButton
    :sorting="activeSortKey === ownSortKey ? activeSortDirection : undefined"
    @update:sort="$emit('update:activeSortKey', ownSortKey)"
  >
    <slot name="label">
      {{ $t(`table.header.${ownSortKey}`) }}
    </slot>
  </NovaSortButton>
</template>

<script setup lang="ts">
import { SortDirection, SortKey } from "@/types/SortingTypes";
import NovaSortButton from "@/ui-kit/NovaSortButton/NovaSortButton.vue";
interface Props {
  activeSortKey: SortKey;
  ownSortKey: SortKey;
  activeSortDirection: SortDirection;
}
interface Events {
  (e: "update:activeSortKey", value: SortKey): void;
}

defineProps<Props>();
defineEmits<Events>();
</script>

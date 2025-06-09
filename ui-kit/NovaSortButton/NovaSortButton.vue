<template>
  <button class="SortButton" @click="$emit('update:sort')">
    <slot />
    <div class="SortButton__arrow">
      <NovaIcon
        class="SortButton__arrow--desc"
        name="sort-arrow"
        :size="10"
        :style="{ opacity: sorting === 'desc' ? 1 : 0.3 }"
      />
      <NovaIcon
        class="SortButton__arrow--asc"
        name="sort-arrow"
        :size="10"
        :style="{ opacity: sorting === 'asc' ? 1 : 0.3 }"
      />
    </div>
  </button>
</template>

<script setup lang="ts">
import NovaIcon from "../NovaIcon/NovaIcon.vue";
interface Props {
  sorting?: "asc" | "desc";
}
interface Events {
  (e: "update:sort"): void;
}

defineProps<Props>();
defineEmits<Events>();
</script>

<style lang="scss">
@import "@/assets/scss/utilities";

.SortButton {
  display: flex;
  align-items: center;
  color: var(--color-primary-100);
  cursor: pointer;

  &:hover {
    color: (var(--color-primary-110));
  }

  &__arrow {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 6px;

    &--asc {
      transform: rotate(180deg);
      position: relative;
      bottom: 2px;
    }

    &--desc {
      top: 2px;
    }
  }
}
</style>

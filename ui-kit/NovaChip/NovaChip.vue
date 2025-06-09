<template>
  <div class="NovaChip">
    <slot />
    <button class="NovaChip__button" @click="$emit('click:close')">
      <NovaIcon name="close" :size="12"></NovaIcon>
    </button>
  </div>
</template>

<script setup lang="ts">
import NovaIcon from "../NovaIcon/NovaIcon.vue";
const props = withDefaults(defineProps<{ height?: number }>(), { height: 22 });
interface Events {
  (e: "click:close"): void;
}

defineEmits<Events>();

const CHIP_HEIGHT = `${props.height}px`;
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.NovaChip {
  background: var(--color-primary-10);
  padding: rem(2) rem(8);
  border-radius: 16px;
  display: flex;
  align-items: center;
  height: v-bind(CHIP_HEIGHT);
  @include font-regular(14);

  &__button {
    border: none;
    background: none;
    padding: 0;
    margin-left: rem(4);
    cursor: pointer;
  }
}
</style>

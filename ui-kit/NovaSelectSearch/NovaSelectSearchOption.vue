<template>
  <div class="w-full flex flex-row justify-between items-center">
    <span
      :class="{ disabled: option.disabled }"
      class="whitespace-nowrap text-ellipsis overflow-hidden"
      :title="option.label"
    >
      <slot name="label" :option="option">
        {{ option.label }}
      </slot>
    </span>
    <NovaLabel v-if="hasBadge" :theme="option.badge!.theme" class="flex-shrink-0 ml-2">
      <span class="badge-text whitespace-nowrap" :title="option.badge!.text">
        {{ option.badge!.text }}
      </span>
    </NovaLabel>
  </div>
</template>

<script setup lang="ts" generic="TValue">
import { BaseOption } from "@/types/Option";
import NovaLabel, { LabelTheme } from "../NovaLabel/NovaLabel.vue";

export interface NovaSelectSearchOptionItem<T> extends BaseOption<T> {
  badge?: { text: string; theme: LabelTheme };
  [key: string]: unknown;
}

export interface Props<T> {
  option: NovaSelectSearchOptionItem<T>;
}

const props = defineProps<Props<TValue>>();

const hasBadge = computed(() => !!props.option.badge?.text);
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.disabled {
  color: var(--color-text-90);
}

.badge-text {
  color: white;
}
</style>

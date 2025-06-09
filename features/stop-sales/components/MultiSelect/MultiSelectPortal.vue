<template>
  <Teleport to="body">
    <div v-if="isDropdownOpen" ref="floatingRef" :style="floatingStyles" :="$attrs">
      <slot />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import { useMultiSelectContext } from "./useMultiSelect";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  matchTriggerWidth?: boolean;
}>();

const { triggerRef, floatingRef, floatingStyles, isDropdownOpen, floatingMatchTriggerWidth } = useMultiSelectContext();

watchEffect(() => {
  floatingMatchTriggerWidth.value = props.matchTriggerWidth;
});

onClickOutside(
  floatingRef,
  () => {
    isDropdownOpen.value = false;
  },
  { ignore: [triggerRef] }
);
</script>

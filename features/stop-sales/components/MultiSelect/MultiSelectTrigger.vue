<template>
  <template v-if="asChild">
    <slot :trigger-props="triggerProps" :actions="triggerActions" />
  </template>
  <template v-else>
    <button ref="triggerRefInternal" @click="triggerActions.handleToggle">
      <slot />
    </button>
  </template>
</template>

<script setup lang="ts">
import { useMultiSelectContext } from "./useMultiSelect";

defineProps<{
  asChild?: boolean;
}>();

type triggerProps = {
  "data-trigger": string;
};

type triggerActions = {
  handleOpen: () => void;
  handleClose: () => void;
  handleToggle: () => void;
};

defineSlots<{
  default(props?: { triggerProps: triggerProps; actions: triggerActions }): any;
}>();

const id = useId();
const { triggerRef: triggerRefInternal, isDropdownOpen } = useMultiSelectContext();

function updateInternalRef() {
  triggerRefInternal.value = document.querySelector(`[data-trigger='${id}']`);
}
onMounted(updateInternalRef);

const triggerProps: triggerProps = {
  "data-trigger": id,
};
const triggerActions: triggerActions = {
  handleOpen: () => {
    isDropdownOpen.value = true;
  },
  handleClose: () => {
    isDropdownOpen.value = false;
  },
  handleToggle: () => {
    isDropdownOpen.value = !isDropdownOpen.value;
  },
};
</script>

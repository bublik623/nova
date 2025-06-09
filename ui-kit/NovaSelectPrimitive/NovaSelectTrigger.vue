<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted } from "vue";
import type { Ref, DeepReadonly } from "vue";

interface BaseSelectContext {
  isOpen: DeepReadonly<Ref<boolean>>;
  toggleDropdown: () => void;
  openDropdown: () => void;
  closeDropdown: (refocus?: boolean) => void;
  registerTriggerRef: (el: HTMLElement | null) => void;
}

const elRef = ref<HTMLElement | null>(null);
const context = inject<BaseSelectContext>("BaseSelectContext");

if (!context) throw new Error("BaseSelectTrigger must be used within a BaseSelectRoot");

onMounted(() => context?.registerTriggerRef(elRef.value));
onUnmounted(() => context?.registerTriggerRef(null));

const handleClick = () => context?.toggleDropdown();
const handleKeydown = (event: KeyboardEvent) => {
  if (["Enter", " "].includes(event.key)) {
    event.preventDefault();
    context?.toggleDropdown();
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    context?.openDropdown();
  }
  if (event.key === "Escape") {
    event.preventDefault();
    context?.closeDropdown(true);
  }
};
</script>

<template>
  <button
    ref="elRef"
    type="button"
    class="base-select-trigger focus:outline-none focus:ring-none"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <slot></slot>
  </button>
</template>

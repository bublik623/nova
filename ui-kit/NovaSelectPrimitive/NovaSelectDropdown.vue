<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted } from "vue";
import type { Ref, DeepReadonly } from "vue";

interface BaseSelectContext {
  isOpen: DeepReadonly<Ref<boolean>>;
  closeDropdown: (refocus?: boolean) => void; // The function itself
  registerPanelRef: (el: HTMLElement | null) => void;
}

const elRef = ref<HTMLElement | null>(null);
const context = inject<BaseSelectContext>("BaseSelectContext");

if (!context) throw new Error("BaseSelectContent must be used within a BaseSelectRoot");

onMounted(() => context?.registerPanelRef(elRef.value));
onUnmounted(() => context?.registerPanelRef(null));

const handleEscape = () => {
  context?.closeDropdown(true);
};
</script>
<template>
  <div
    v-show="context?.isOpen.value"
    ref="elRef"
    tabindex="-1"
    class="absolute z-10 mt-1 min-w-max focus:outline-none"
    :data-state="context?.isOpen.value ? 'open' : 'closed'"
    @keydown.esc.prevent="handleEscape"
  >
    <slot :close="context?.closeDropdown"></slot>
  </div>
</template>

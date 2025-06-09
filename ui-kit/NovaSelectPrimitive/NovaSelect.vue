<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted, readonly } from "vue";

// --- State ---
const isOpen = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

// --- Emits ---
const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

// --- Methods ---
const openDropdown = () => {
  if (isOpen.value) return;
  isOpen.value = true;
  emit("update:open", true);
};
const closeDropdown = (refocusTrigger = false) => {
  if (!isOpen.value) return;
  isOpen.value = false;
  emit("update:open", false);
  if (refocusTrigger) {
    triggerRef.value?.focus();
  }
};
const toggleDropdown = () => {
  if (isOpen.value) {
    closeDropdown(true);
  } else {
    openDropdown();
  }
};

// --- Ref Registration ---
const registerTriggerRef = (el: HTMLElement | null) => {
  triggerRef.value = el;
};
const registerPanelRef = (el: HTMLElement | null) => {
  panelRef.value = el;
};

// --- Event Handling (Click Outside) ---
const handleClickOutside = (event: MouseEvent) => {
  if (
    isOpen.value &&
    triggerRef.value &&
    !triggerRef.value.contains(event.target as Node) &&
    panelRef.value &&
    !panelRef.value.contains(event.target as Node)
  ) {
    closeDropdown();
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  document.addEventListener("click", handleClickOutside, true);
});
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside, true);
});

// --- Provide Context ---
provide("BaseSelectContext", {
  isOpen: readonly(isOpen),
  toggleDropdown,
  openDropdown,
  closeDropdown,
  registerTriggerRef,
  registerPanelRef,
});

defineExpose({
  closeDropdown,
});
</script>

<template>
  <div ref="rootRef" class="relative block">
    <slot></slot>
  </div>
</template>

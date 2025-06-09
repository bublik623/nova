<script setup lang="ts" generic="T extends string">
import { Placement } from "@floating-ui/vue";
import { MultiSelectOption } from "./multi-select.types";
import { useMultiSelect, provideMultiSelectContext } from "./useMultiSelect";
import { watchIgnorable } from "@vueuse/core";

const props = withDefaults(
  defineProps<{
    isOpen?: boolean;
    placement?: Placement;
  }>(),
  {
    placement: "bottom-start",
  }
);

const selectedValuesModel = defineModel<MultiSelectOption<T>[]>("selectedValues", {
  required: false,
});

const context = useMultiSelect<T>();

const { ignoreUpdates: ignoreContextUpdates } = watchIgnorable(
  context.selectedValuesMap,
  (newSelectedValues) => {
    selectedValuesModel.value = Array.from(newSelectedValues.values());
  },
  { deep: true }
);

watch(
  () => selectedValuesModel.value,
  (newValue) => {
    ignoreContextUpdates(() => {
      context.setSelectedValues(newValue ?? []);
    });
  },
  { deep: true, immediate: true }
);

onMounted(() => {
  ignoreContextUpdates(() => {
    context.isDropdownOpen.value = props.isOpen;
    context.floatingPlacement.value = props.placement;
  });
});

provideMultiSelectContext(context);
</script>

<template>
  <slot
    :selected-items-count="context.selectedItemsCount.value"
    :is-dropdown-open="context.isDropdownOpen.value"
  ></slot>
</template>

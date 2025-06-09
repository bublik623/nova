<script setup lang="ts" generic="T extends string">
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import { MultiSelectOption } from "./multi-select.types";
import { useMultiSelectContext } from "./useMultiSelect";

const options = defineModel<MultiSelectOption<T>[]>("options", { required: true });

const multiSelectContext = useMultiSelectContext<T>();

const selectAllStatus = computed(() => {
  if (options.value.length === 0) {
    return "unchecked";
  }
  if (options.value.length === multiSelectContext.selectedValuesMap.value.size) {
    return "checked";
  }
  if (multiSelectContext.selectedValuesMap.value.size > 0) {
    return "indeterminate";
  }
  return "unchecked";
});

function handleSelectAll() {
  multiSelectContext.toggleAll(options.value);
}
</script>

<template>
  <NovaCheckbox
    value="select-all"
    :status="selectAllStatus"
    :disabled="options.length === 0"
    @update:status="handleSelectAll"
  />
</template>

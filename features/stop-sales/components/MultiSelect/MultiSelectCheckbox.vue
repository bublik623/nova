<script setup lang="ts" generic="T extends string">
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import { MultiSelectOption } from "./multi-select.types";
import { useMultiSelectContext } from "./useMultiSelect";

const model = defineModel<MultiSelectOption<T>>({ required: true });
const multiSelectContext = useMultiSelectContext<T>();

const handleSelectOption = async (selectedOption: MultiSelectOption<T>) => {
  multiSelectContext.toggleValue(selectedOption);
};

const isSelected = computed(() => multiSelectContext.selectedValuesMap.value?.has(model.value.val));
</script>

<template>
  <NovaCheckbox
    :value="model.val"
    :status="isSelected ? 'checked' : 'unchecked'"
    @update:status="() => handleSelectOption(model)"
  />
</template>

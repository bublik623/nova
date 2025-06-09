<template>
  <NovaMultiSelect
    :model-value="selectedOptions"
    :options="config.options"
    :name="config.label"
    show-searchbar
    @update:model-value="handleUpdate"
  />
</template>

<script setup lang="ts">
import { Option } from "@/types/Option";
import {
  type AdvancedFilterMultiselectConfig,
  type AdvancedFilterMultiselectValue,
} from "@/features/advanced-search/types/filters";
import NovaMultiSelect from "@/ui-kit/NovaMultiSelect/NovaMultiSelect.vue";

interface Props {
  config: AdvancedFilterMultiselectConfig;
  modelValue: AdvancedFilterMultiselectValue;
}

type Events = (event: "update:modelValue", value: AdvancedFilterMultiselectValue) => void;

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const selectedOptions = computed(() => {
  return props.config.options.filter((option) =>
    props.modelValue.value.some((selectedOption) => selectedOption.value === option.value)
  );
});

const handleUpdate = (options: Option[]) => {
  emits("update:modelValue", {
    type: "multiselect",
    value: options,
    isDefaultValue: false,
  });
};
</script>

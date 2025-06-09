<template>
  <div class="NovaCheckboxGroup">
    <ul v-if="readonly">
      <li v-for="value in model" :key="String(value)" class="text-sm font-normal mt-1">
        • {{ getOptionFromValue(value)?.label }}
      </li>

      <li v-if="model.length === 0" class="text-sm font-normal">
        <NoContentUtil />
      </li>
    </ul>

    <ul v-else class="grid">
      <li v-for="option in options" :key="option.label">
        <NovaCheckbox
          :disabled="disabled"
          :label="option.label"
          :value="option.value"
          :status="getCheckboxStatus(option)"
          @update:status="() => handleUpdate(option)"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts" generic="T">
import { isEqual } from "lodash";
import NovaCheckbox from "../NovaCheckbox/NovaCheckbox.vue";
import NoContentUtil from "@/features/experience-shared/components/NoContentUtil.vue";

type CheckboxGroupOption = {
  label: string;
  value: T;
};

interface Props {
  options: CheckboxGroupOption[];
  readonly?: boolean;
  disabled?: boolean;
}

const props = defineProps<Props>();

const model = defineModel<T[]>({ default: [] });

function hasOption(option: CheckboxGroupOption) {
  return !!(model.value ?? []).find((v) => isEqual(v, option.value));
}

function handleUpdate(option: CheckboxGroupOption) {
  if (hasOption(option)) {
    model.value = model.value.filter((v) => !isEqual(v, option.value));
  } else {
    model.value = [...model.value, option.value];
  }
}

function getOptionFromValue(value: T) {
  return props.options.find((option) => isEqual(option.value, value));
}

function getCheckboxStatus(option: CheckboxGroupOption) {
  return hasOption(option) ? "checked" : "unchecked";
}
</script>

<style scoped lang="scss">
@import "@/assets/scss/utilities";

.NovaCheckboxGroup {
  .grid {
    padding-bottom: rem(10);
    display: grid;
    gap: rem(13);
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

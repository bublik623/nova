<script setup lang="ts">
import { Option } from "@/types/Option";
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaDropdown from "@/ui-kit/NovaDropdown/NovaDropdown.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import NovaMultiSelect from "@/ui-kit/NovaMultiSelect/NovaMultiSelect.vue";
import NovaOptionsList from "@/ui-kit/NovaOptionsList/NovaOptionsList.vue";
import NovaSelect from "@/ui-kit/NovaSelect/NovaSelect.vue";
import NovaSelectPrimitive from "@/ui-kit/NovaSelectPrimitive/NovaSelect.vue";
import NovaSelectPrimitiveTrigger from "@/ui-kit/NovaSelectPrimitive/NovaSelectTrigger.vue";
import NovaSelectPrimitiveContent from "@/ui-kit/NovaSelectPrimitive/NovaSelectDropdown.vue";
import NovaSelectPrimitiveItem from "@/ui-kit/NovaSelectPrimitive/NovaSelectOption.vue";
import NovaSelectSearch from "@/ui-kit/NovaSelectSearch/NovaSelectSearch.vue";
import InlineMultiSelect from "@/features/opinoia/operational/shared/inline-multi-select/InlineMultiSelect.vue";

const options: Option[] = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
  { label: "7", value: "7" },
  { label: "8", value: "8" },
];

const multiselectValue: Option[] = [];

const primitiveMultiselectValue: Ref<string[]> = ref([]);
function isOptionSelected(option: Option) {
  return !!primitiveMultiselectValue.value.find((selectedOptionValue) => selectedOptionValue === option.value);
}

function getOptionSelectionStatus(option: Option) {
  return isOptionSelected(option) ? "checked" : "unchecked";
}
function toggleOptionSelection(option: Option) {
  if (isOptionSelected(option)) {
    primitiveMultiselectValue.value.splice(primitiveMultiselectValue.value.indexOf(option.value), 1);
  } else {
    primitiveMultiselectValue.value.push(option.value);
  }
}

const selectedValues: Ref<"all" | string[]> = ref("all");
</script>
<template>
  <div style="width: 400px; margin: 20px">
    NovaDropdown:
    <NovaDropdown :options="options"></NovaDropdown>

    <br />

    NovaMultiSelect:
    <NovaMultiSelect :options="options" :model-value="multiselectValue"></NovaMultiSelect>

    <br />

    NovaOptionsList:
    <NovaOptionsList :options="options"></NovaOptionsList>

    <br />

    NovaSelect:
    <NovaSelect :options="options"></NovaSelect>

    <br />

    NovaSelectSearch:
    <NovaSelectSearch id="nova-select-search" :options="options"></NovaSelectSearch>

    <br />

    NovaSelectPrimitive:
    <NovaSelectPrimitive>
      <NovaSelectPrimitiveTrigger class="inline-flex items-center justify-between w-full">
        <div class="flex flex-row justify-between w-full">
          <span>SELECTED OPTION(S) LABEL</span>
          <NovaIcon name="chevron-down" />
        </div>
      </NovaSelectPrimitiveTrigger>
      <NovaSelectPrimitiveContent class="w-full">
        <!-- frame and appearence -->
        <div class="w-full overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <!-- scrolling anjd padding -->
          <div class="max-h-60 overflow-y-auto py-1">
            <NovaSelectPrimitiveItem
              v-for="option in options"
              :key="option.value"
              :value="option.value"
              class="min-w-max flex flex-row items-center w-xl w-44"
            >
              <NovaCheckbox
                class="mr-2"
                :value="option"
                :status="getOptionSelectionStatus(option)"
                @update:status="toggleOptionSelection(option)"
              />
              <span>{{ option.label }}</span>
            </NovaSelectPrimitiveItem>
          </div>
        </div>
      </NovaSelectPrimitiveContent>
    </NovaSelectPrimitive>

    <br />
    <br />

    InlineMultiSelect:
    <InlineMultiSelect :options="options" :selected-values="selectedValues" />
  </div>
</template>

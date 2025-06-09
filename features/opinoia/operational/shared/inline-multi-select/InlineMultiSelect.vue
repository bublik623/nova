<script setup lang="ts" generic="TValue extends PropertyKey">
import NovaSelect from "@/ui-kit/NovaSelectPrimitive/NovaSelect.vue";
import NovaSelectTrigger from "@/ui-kit/NovaSelectPrimitive/NovaSelectTrigger.vue";
import NovaSelectDropdown from "@/ui-kit/NovaSelectPrimitive/NovaSelectDropdown.vue";
import NovaSelectOption from "@/ui-kit/NovaSelectPrimitive/NovaSelectOption.vue";
import NovaIcon from "@/ui-kit/NovaIcon/NovaIcon.vue";
import { BaseOption } from "@/types/Option";
import NovaCheckbox from "@/ui-kit/NovaCheckbox/NovaCheckbox.vue";
import NovaInputRadioGroup from "@/ui-kit/NovaInputRadioGroup/NovaInputRadioGroup.vue";
import { useMultiSelect } from "./useMultiSelect";
import { computed, ref, toRef, nextTick } from "vue";
import { autoUpdate, useFloating } from "@floating-ui/vue";
import { useId } from "vue";

export type InlineMultiSelectProps<T> = {
  options: BaseOption<T>[];
  contentTestId?: string;
};

const props = withDefaults(defineProps<InlineMultiSelectProps<TValue>>(), {
  contentTestId: "inline-select-content",
});
const selectedOptionsValues = defineModel<TValue[] | "all">("selectedValues", { required: true });

const id = useId();

const { $t } = useNuxtApp();

const searchInput = ref<HTMLInputElement | null>(null); // Renamed from searchInputRef for consistency
const isOpen = ref(false);

const options = computed(() => props.options);
const filterKeyword = ref("");
const { matchingOptions, activeMode, setMode, isOptionSelected, toggleOptionSelection } = useMultiSelect<TValue>(
  options,
  filterKeyword,
  toRef(selectedOptionsValues) // Use toRef to pass reactive prop/model
);

const selectedOptionsLabels = computed(() => {
  if (selectedOptionsValues.value === "all") {
    return $t("common.all");
  }
  // Ensure modelValue is treated as an array even if empty
  const currentSelection = Array.isArray(selectedOptionsValues.value) ? selectedOptionsValues.value : [];
  const selectedOptions = props.options.filter((option) => currentSelection.includes(option.value));
  // Handle cases where labels might be undefined/null if data is inconsistent
  const selectedLabels = selectedOptions.map((selectedOption) => selectedOption.label ?? "").filter(Boolean);

  return selectedLabels.join(", ");
});

function getOptionSelectionStatus(option: BaseOption<TValue>) {
  // Make sure activeMode ref is accessed via .value
  return activeMode.value === "specific" && isOptionSelected(option) ? "checked" : "unchecked";
}

async function handleOpenDropdownChange(newIsOpenState: boolean) {
  if (newIsOpenState) {
    await nextTick(() => {
      searchInput.value?.focus(); // Use correct ref name
    });
  }

  isOpen.value = newIsOpenState;
}

const trigger = ref();
const dropdown = ref();
const { floatingStyles } = useFloating(trigger, dropdown, {
  placement: "bottom-end",
  open: isOpen.value,
  whileElementsMounted: autoUpdate,
});
</script>

<template>
  <NovaSelect @update:open="handleOpenDropdownChange">
    <NovaSelectTrigger
      ref="trigger"
      data-testid="inline-select-trigger"
      class="flex flex-row justify-between items-center w-full"
    >
      <span class="break-words whitespace-normal text-start">{{ selectedOptionsLabels }}</span>
      <NovaIcon name="chevron-down" class="flex-shrink-0 ml-1" />
    </NovaSelectTrigger>

    <Teleport to="body">
      <NovaSelectDropdown ref="dropdown" :style="floatingStyles" class="w-96" :data-testid="contentTestId">
        <div class="overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 w-full">
          <div class="max-h-60 overflow-y-auto p-2 w-full">
            <div class="flex flex-col">
              <div class="flex flex-row items-center rounded-xl bg-neutral-30 h-min-max p-2 my-2">
                <NovaIcon name="search" class="color-black mr-2" />
                <input
                  ref="searchInput"
                  type="search"
                  :value="filterKeyword"
                  class="bg-transparent placeholder:italic placeholder:text-text-90 focus:outline-none focus:ring-none w-full"
                  :placeholder="$t('common.search')"
                  data-testid="inline-select-search"
                  @input="(x) => filterKeyword = (x.target as HTMLInputElement).value"
                />
              </div>
              <NovaInputRadioGroup
                v-model="activeMode"
                data-testid="inline-select-mode-group"
                class="mt-3"
                :name="`${id}-selection-mode`"
                layout="vertical"
                :options="[
                  { label: 'All', value: 'all' },
                  { label: 'Specific', value: 'specific' },
                ]"
                @update:model-value="(value) => setMode(value as 'all' | 'specific')"
              />

              <div class="flex flex-col mt-1">
                <NovaSelectOption
                  v-for="option in matchingOptions"
                  :key="option.value"
                  :value="option.value"
                  :data-testid="`option-item-${String(option.value)}`"
                  class="flex flex-row items-center"
                  @click="toggleOptionSelection(option)"
                >
                  <label
                    :for="`option-checkbox-${String(option.value)}`"
                    class="flex-grow flex items-center gap-2 cursor-pointer p-1 rounded"
                  >
                    <NovaCheckbox
                      :id="`option-checkbox-${String(option.value)}`"
                      :data-testid="`option-checkbox-${String(option.value)}`"
                      class="mr-2"
                      :value="option.value"
                      :status="getOptionSelectionStatus(option)"
                      @update:status="toggleOptionSelection(option)"
                    />
                    <span data-testid="option-label">{{ option.label }}</span>
                  </label>
                </NovaSelectOption>
              </div>
            </div>
          </div>
        </div>
      </NovaSelectDropdown>
    </Teleport>
  </NovaSelect>
</template>

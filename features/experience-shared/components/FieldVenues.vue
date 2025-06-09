<script setup lang="ts">
import {
  MultiSelect,
  MultiSelectCheckbox,
  MultiSelectItem,
  MultiSelectSearch,
  MultiSelectPortal,
  MultiSelectTrigger,
} from "@/features/stop-sales/components/MultiSelect";
import { MultiSelectOption } from "@/features/stop-sales/components/MultiSelect/multi-select.types";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import { watchIgnorable } from "@vueuse/core";
import { Venue } from "@/types/generated/GeoMasterDataApi";

export interface FieldVenuesProps {
  options: Venue[];
  disabled?: boolean;
}

const props = defineProps<FieldVenuesProps>();
const selectedItems = ref<MultiSelectOption<string>[]>([]);
const selectedItemsModel = defineModel<string[]>("modelValue", { default: () => [] });

const mapOption = (option: Venue): MultiSelectOption<string> => ({
  label: option.name,
  description: props.options.find((item) => item.code === option.code),
  val: option.code,
});

const { ignoreUpdates: ignoreInternalUpdates } = watchIgnorable(
  () => selectedItems.value,
  () => {
    selectedItemsModel.value = selectedItems.value.map((item) => item.val);
  }
);

watch(
  selectedItemsModel,
  () => {
    ignoreInternalUpdates(() => {
      selectedItems.value = selectedItemsModel.value.map((code) => ({ label: code, val: code }));
    });
  },
  { immediate: true }
);

// sort options by city and then name
const sortedOptions = computed(() =>
  [...props.options].sort((a, b) => {
    const cityComparison = a.city.localeCompare(b.city);
    if (cityComparison !== 0) {
      return cityComparison;
    }
    return a.name.localeCompare(b.name);
  })
);

const multiSelectOptions = computed<MultiSelectOption<string>[]>(() => sortedOptions.value.map(mapOption));

const searchText = ref("");

const filteredOptions = computed(() => {
  if (!searchText.value) return multiSelectOptions.value;

  const searchValue = searchText.value.toLowerCase();
  return multiSelectOptions.value.filter((option) => option.label.toLowerCase().includes(searchValue));
});

const handleClear = () => {
  selectedItems.value = [];
};
</script>

<template>
  <MultiSelect v-model:selected-values="selectedItems">
    <MultiSelectTrigger v-slot="context" as-child>
      <div>
        <MultiSelectSearch
          v-bind="context?.triggerProps"
          v-model="searchText"
          :disabled="disabled"
          :placeholder="$t('experience.location.venues.placeholder')"
          :input-props="{ 'data-testid': 'field-venues-input', autocomplete: 'off' }"
          :button-clear-props="{ 'data-testid': 'field-venues-clear' }"
          @click="context?.actions.handleOpen"
        />
      </div>
    </MultiSelectTrigger>
    <MultiSelectPortal
      class="max-h-56 mt-1 overflow-y-auto overflow-x-hidden border border-neutral-60 rounded-lg shadow-soft bg-white"
      match-trigger-width
      data-testid="field-venues-dropdown"
    >
      <div>
        <div
          class="px-2 py-2.5 h-10 flex justify-between items-center border-b border-neutral-40 sticky top-0 bg-white z-10"
        >
          <span data-testid="field-venues-selected-text" class="text-xs font-normal text-text-90">
            {{ selectedItems.length }} {{ $t("common.dropdown.header.selected") }}
          </span>
          <NovaButton
            class="mr-2"
            variant="underlined"
            :disabled="!selectedItems.length"
            size="xs"
            data-testid="clear-all"
            @click="handleClear"
          >
            {{ $t("common.dropdown.clear.button") }}
          </NovaButton>
        </div>
        <div>
          <MultiSelectItem
            v-for="option in filteredOptions"
            :key="option.val"
            :value="option.val"
            class="flex items-center py-2 px-2 hover:bg-neutral-10 cursor-pointer"
            data-testid="option-label"
          >
            <MultiSelectCheckbox :model-value="option" />
            <div class="ml-2">
              <span class="font-normal text-sm mr-2">{{ option.label }}</span>
            </div>
          </MultiSelectItem>
        </div>
        <div v-if="filteredOptions.length === 0" class="text-center py-6 text-xs" data-testid="no-results">
          {{ $t("common.search.no-items-found") }}
        </div>
      </div>
    </MultiSelectPortal>
  </MultiSelect>
</template>

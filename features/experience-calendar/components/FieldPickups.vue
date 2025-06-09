<script setup lang="ts">
import { MultiSelectOption } from "@/features/stop-sales/components/MultiSelect/multi-select.types";
// prettier-ignore
import { MultiSelect, MultiSelectCheckbox, MultiSelectItem, MultiSelectSearch, MultiSelectPortal, MultiSelectTrigger, } from "@/features/stop-sales/components/MultiSelect";
import { PickupPlaceWithId } from "../types/Pickups";
import NovaButton from "@/ui-kit/NovaButton/NovaButton.vue";
import { watchIgnorable } from "@vueuse/core";

export interface FieldPickupsProps {
  options: PickupPlaceWithId[];
  disabled?: boolean;
  placeholder?: string;
}

const props = defineProps<FieldPickupsProps>();
const selectedItems = ref<MultiSelectOption<string>[]>([]);
const selectedItemsModel = defineModel<PickupPlaceWithId[]>("modelValue", { default: () => [] });

const mapOption = (option: PickupPlaceWithId): MultiSelectOption<string> => ({
  label: option.name,
  description: option.address,
  val: option.id,
});

const { ignoreUpdates: ignoreInternalUpdates } = watchIgnorable(
  () => selectedItems.value,
  () => {
    selectedItemsModel.value = props.options.filter((option) =>
      selectedItems.value.map((item) => item.val).includes(option.id)
    );
  }
);

watch(
  selectedItemsModel,
  () => {
    ignoreInternalUpdates(() => {
      selectedItems.value = props.options
        .filter((option) => selectedItemsModel.value.map((item) => item.id).includes(option.id))
        .map(mapOption);
    });
  },
  { immediate: true }
);

const multiSelectOptions = computed<MultiSelectOption<string>[]>(() => props.options.map(mapOption));

const searchText = ref("");

const filteredOptions = computed(() => {
  return multiSelectOptions.value.filter((option) => {
    const searchValue = new RegExp(searchText.value.toLocaleLowerCase(), "i");
    return searchValue.test(option.label) || searchValue.test(option.description);
  });
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
          :placeholder="$t('common.search.placeholder')"
          :input-props="{ 'data-testid': 'field-pickups-input', autocomplete: 'off' }"
          :button-clear-props="{ 'data-testid': 'field-pickups-clear' }"
          @update:model-value="context?.actions.handleOpen"
          @click="context?.actions.handleOpen"
        />
      </div>
    </MultiSelectTrigger>
    <MultiSelectPortal
      class="max-h-56 mt-1 overflow-y-auto overflow-x-hidden border border-neutral-60 rounded-lg shadow-soft bg-white"
      :match-trigger-width="true"
      data-testid="field-pickups-dropdown"
    >
      <div>
        <div
          class="px-2 py-2.5 h-10 flex justify-between items-center border-b border-neutral-40 sticky top-0 bg-white z-10"
        >
          <span class="text-xs font-normal text-text-90">
            {{ selectedItems.length }} {{ $t("common.dropdown.header.selected") }}
          </span>
          <NovaButton
            class="mr-2"
            variant="underlined"
            :disabled="!selectedItems.length"
            size="xs"
            data-testid="dropdown-clear-all"
            @click="handleClear"
            >{{ $t("common.dropdown.clear.button") }}
          </NovaButton>
        </div>
        <div>
          <MultiSelectItem
            v-for="option in filteredOptions"
            :key="option.value"
            :value="option.value"
            class="flex items-center py-2 px-2 hover:bg-neutral-10 cursor-pointer"
            data-testid="pickup-place-label"
          >
            <MultiSelectCheckbox :model-value="option" />
            <div class="ml-2">
              <span class="font-normal text-sm mr-2">{{ option.label }}</span>
              <span class="text-text-80 text-xs font-normal">{{ option.description }}</span>
            </div>
          </MultiSelectItem>
        </div>
        <div
          v-if="filteredOptions.length === 0"
          class="text-center py-6 text-xs"
          data-testid="field-pickups-no-results"
        >
          {{ $t("experience.pickups.pickup_places.no_items_found") }}
        </div>
      </div>
    </MultiSelectPortal>
  </MultiSelect>
</template>

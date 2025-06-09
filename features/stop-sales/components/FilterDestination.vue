<template>
  <MultiSelect v-model:selected-values="selectedItems">
    <template #default="{ isDropdownOpen }">
      <MultiSelectTrigger v-slot="context" as-child>
        <FilterButton
          v-bind="context?.triggerProps"
          v-model:selected-count="selectedItems.length"
          class="w-full rounded-tl-lg"
          :class="{ 'rounded-bl-lg': !isDropdownOpen }"
          :is-open="isDropdownOpen"
          :selected-items-count="selectedItems.length"
          :title="$t('stop_sales.filter.destination.title')"
          data-testid="button-destination"
          @click="handleTrigger(context?.actions.handleToggle)"
        />
      </MultiSelectTrigger>
      <MultiSelectPortal
        class="px-5 py-4 content max-w-[calc(32rem+1px)] mt-[1px] bg-white w-full ring-1 ring-primary-100 rounded-b-lg"
        data-testid="filter-destinations-content"
      >
        <div class="">
          <div class="bg-gray-100 p-2 rounded">
            <MultiSelectSearch v-model="searchQuery" :placeholder="$t('stop_sales.filter.common.search_for_element')" />
          </div>
          <NovaSpinner v-if="isLoading" :size="16" class="m-auto my-2" />
          <div v-else class="flex items-center gap-2 py-3 border-b border-neutral-40 font-normal">
            <MultiSelectAllCheckbox :options="items" />
            <span class="text-sm">{{
              $t("stop_sales.filter.common.select_all_with_count", { placeholders: { count: selectedItems.length } })
            }}</span>
          </div>
          <div v-if="items.length" class="max-h-[20rem] overflow-y-auto">
            <div
              v-for="item in items"
              :key="item.val"
              :data-destination-id="item.val"
              class="text-sm flex items-center gap-2 py-2 font-normal"
            >
              <MultiSelectCheckbox :model-value="item" />
              <MultiSelectItem data-testid="option-label" class="truncate" :for="`checkbox-${item.val}`">
                {{ item.label }}
              </MultiSelectItem>
              <span class="text-text-80 flex-shrink-0 truncate">{{ item.subLabel }}</span>
            </div>
          </div>
          <div v-else class="text-sm text-center mt-2">
            {{ $t("common.no.items.found") }}
          </div>
        </div>
      </MultiSelectPortal>
    </template>
  </MultiSelect>
</template>

<script setup lang="ts">
import {
  MultiSelect,
  MultiSelectCheckbox,
  MultiSelectItem,
  MultiSelectSearch,
  MultiSelectAllCheckbox,
  MultiSelectPortal,
  MultiSelectTrigger,
} from "@/features/stop-sales/components/MultiSelect";
import FilterButton from "@/features/stop-sales/components/FilterButton.vue";
import { MultiSelectOption } from "@/features/stop-sales/components/MultiSelect/multi-select.types";
import NovaSpinner from "@/ui-kit/NovaSpinner/NovaSpinner.vue";

export type DestinationOption = MultiSelectOption<string> & { subLabel: string };

const emit = defineEmits<{
  trigger: [];
}>();

const searchQuery = defineModel<string>("search", { default: "" });
const items = defineModel<DestinationOption[]>({ default: [] });
const selectedItems = defineModel<DestinationOption[]>("selectedItems", { default: [] });
const isLoading = defineModel<boolean>("isLoading");
function handleTrigger(handleToggle?: () => void) {
  handleToggle?.();
  emit("trigger");
}
</script>

<template>
  <MultiSelect v-model:selected-values="selectedItems" placement="bottom-end">
    <template #default="{ isDropdownOpen }">
      <MultiSelectTrigger v-slot="context" as-child>
        <FilterButton
          v-bind="context?.triggerProps"
          class="w-full rounded-tr-lg"
          :class="{ 'rounded-br-lg': !isDropdownOpen }"
          :is-open="isDropdownOpen"
          :selected-items-count="selectedItems.length"
          :title="$t('stop_sales.filter.time_slots.title')"
          data-testid="button-time-slots"
          :disabled="disabled"
          @click="handleTrigger(context?.actions.handleToggle)"
        />
      </MultiSelectTrigger>

      <MultiSelectPortal
        class="px-5 py-4 content max-w-[16rem] mt-[1px] bg-white w-full ring-1 ring-primary-100 rounded-b-lg"
        data-testid="filter-time-slots-content"
      >
        <div class="">
          <div class="bg-gray-100 p-2 rounded">
            <MultiSelectSearch v-model="searchQuery" :placeholder="$t('stop_sales.filter.common.search_for_element')" />
          </div>
          <div class="flex items-center gap-2 py-3 border-b border-neutral-40 font-normal">
            <MultiSelectAllCheckbox :options="items" />
            <span class="text-sm">{{
              $t("stop_sales.filter.common.select_all_with_count", { placeholders: { count: selectedItems.length } })
            }}</span>
          </div>
          <div class="max-h-[20rem] overflow-y-auto">
            <NovaSpinner v-if="isLoading" :size="16" class="m-auto my-2" />
            <div
              v-for="item in filteredItems"
              v-else-if="items.length"
              :key="item.val"
              :data-time-slot="item.val"
              class="text-sm flex items-center gap-2 py-2 font-normal"
            >
              <MultiSelectCheckbox :model-value="item" />
              <MultiSelectItem :for="`checkbox-${item.val}`" data-testid="option-label">
                {{ item.label }}
              </MultiSelectItem>
            </div>
            <div v-else class="text-sm text-center">
              {{ $t("common.no.items.found") }}
            </div>
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

export type TimeSlotOption = MultiSelectOption<string>;

const emit = defineEmits<{
  trigger: [];
}>();

const searchQuery = ref("");
const items = defineModel<TimeSlotOption[]>({ default: [] });
const selectedItems = defineModel<TimeSlotOption[]>("selectedItems", { default: [] });
const disabled = defineModel<boolean>("disabled");
const isLoading = defineModel<boolean>("isLoading");

function handleTrigger(handleToggle?: () => void) {
  handleToggle?.();
  emit("trigger");
}

const filteredItems = computed(() => {
  return items.value.filter((item) => item.label.toLowerCase().includes(searchQuery.value.toLowerCase()));
});
</script>

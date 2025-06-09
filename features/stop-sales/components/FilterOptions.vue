<template>
  <MultiSelect v-model:selected-values="selectedItems">
    <template #default="{ isDropdownOpen }">
      <MultiSelectTrigger v-slot="context" as-child>
        <FilterButton
          v-bind="context?.triggerProps"
          :selected-items-count="selectedItems.length"
          class="w-full"
          :title="$t('stop_sales.filter.options.title')"
          data-testid="button-options"
          :is-open="isDropdownOpen"
          :disabled="disabled"
          @click="handleTrigger(context?.actions.handleToggle)"
        />
      </MultiSelectTrigger>
      <MultiSelectPortal
        class="px-5 py-4 content max-w-[calc(32rem+1px)] mt-[1px] bg-white w-full ring-1 ring-primary-100 rounded-br-lg rounded-bl-lg"
        data-testid="filter-options-content"
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
            <MultiSelectGroup
              v-for="(experiences, cityName) in groupBy(filteredItems, 'city')"
              v-else-if="items.length"
              :key="cityName"
              class="text-xs py-2 text-text-80"
              :label="cityName.toString()"
            >
              <MultiSelectGroup
                v-for="(groupedOptions, experienceName) in sortExperiences(experiences)"
                :key="experienceName"
              >
                <template #label>
                  <div class="flex items-baseline font-normal">
                    <span class="text-sm flex items-center gap-2 py-2 pb-4">
                      {{ experienceName }}
                    </span>
                    <span class="text-xs ml-2.5 text-text-80">{{ groupedOptions[0].experience.subLabel }}</span>
                  </div>
                </template>
                <div
                  v-for="option in groupedOptions.sort(sortByLabel)"
                  :key="option.val"
                  class="flex gap-2 items-center pb-4 pl-4"
                  :data-option-id="option.val"
                >
                  <MultiSelectCheckbox :model-value="option" />
                  <MultiSelectItem
                    data-testid="option-label"
                    :for="`checkbox-${option.val}`"
                    class="truncate font-light text-sm"
                    >{{ option.label }}</MultiSelectItem
                  >
                </div>
              </MultiSelectGroup>
            </MultiSelectGroup>
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
  MultiSelectGroup,
} from "@/features/stop-sales/components/MultiSelect";
import FilterButton from "@/features/stop-sales/components/FilterButton.vue";
import { MultiSelectOption } from "@/features/stop-sales/components/MultiSelect/multi-select.types";
import { groupBy } from "lodash";
import NovaSpinner from "@/ui-kit/NovaSpinner/NovaSpinner.vue";

export type OptionOption = MultiSelectOption<string> & {
  experience: { id: string; label: string; subLabel: string };
  city: string;
};

const emit = defineEmits<{
  trigger: [];
}>();

const searchQuery = ref("");
const items = defineModel<OptionOption[]>({ default: [] });
const selectedItems = defineModel<OptionOption[]>("selectedItems", { default: [] });
const disabled = defineModel<boolean>("disabled");
const isLoading = defineModel<boolean>("isLoading");

const filteredItems = computed(() => {
  return items.value.filter((option) => {
    return option.label.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

function handleTrigger(handleToggle?: () => void) {
  handleToggle?.();
  emit("trigger");
}

function sortByLabel(a: { label: string }, b: { label: string }) {
  return a.label.localeCompare(b.label);
}

const sortExperiences = (experiences: OptionOption[]) => {
  const grouped = groupBy(experiences, "experience.label");
  const sortedEntries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  return Object.fromEntries(sortedEntries);
};
</script>

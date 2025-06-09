<template>
  <MultiSelect v-model:selected-values="selectedItems">
    <template #default="{ isDropdownOpen }">
      <MultiSelectTrigger v-slot="context" as-child>
        <FilterButton
          v-bind="context?.triggerProps"
          v-model:selected-count="selectedItems.length"
          :disabled="disabled"
          class="w-full"
          :title="$t('stop_sales.filter.experiences.title')"
          data-testid="button-experiences"
          :is-open="isDropdownOpen"
          :selected-items-count="selectedItems.length"
          @click="handleTrigger(context?.actions.handleToggle)"
        />
      </MultiSelectTrigger>
      <MultiSelectPortal
        class="px-5 py-4 content max-w-[calc(32rem+1px)] mt-[1px] bg-white w-full ring-1 ring-primary-100 rounded-b-lg"
        data-testid="filter-experiences-content"
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
              v-for="(groupedExperiences, city) in groupBy(items, 'city')"
              v-else-if="items.length"
              :key="city"
              class="text-xs py-2 text-text-80"
              :label="city.toString()"
            >
              <div
                v-for="experience in groupedExperiences.sort(sortByLabel)"
                :key="experience.val"
                class="text-sm flex items-center gap-2 py-2 font-normal"
                :data-experience="experience.val"
              >
                <MultiSelectCheckbox :model-value="experience" />
                <MultiSelectItem data-testid="option-label" class="truncate" :for="`checkbox-${experience.val}`">
                  {{ experience.label }}
                </MultiSelectItem>
                <span class="text-text-80 flex-shrink-0 truncate">{{ experience.val }}</span>
              </div>
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

export type ExperienceOption = MultiSelectOption<string> & { city: string; id: string };

const emit = defineEmits<{
  trigger: [];
}>();

const searchQuery = defineModel<string>("search", { default: "" });
const items = defineModel<ExperienceOption[]>({ default: [] });

const selectedItems = defineModel<ExperienceOption[]>("selectedItems", { default: [] });
const disabled = defineModel<boolean>("disabled", { default: false });
const isLoading = defineModel<boolean>("isLoading");

const sortByLabel = (a: ExperienceOption, b: ExperienceOption) => a.label.localeCompare(b.label);

function handleTrigger(handleToggle?: () => void) {
  handleToggle?.();
  emit("trigger");
}
</script>

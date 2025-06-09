<template>
  <div class="AdvancedSearchView hide-scrollbar">
    <div class="AdvancedSearchView__firstColumn mr-4">
      <AdvancedSearchQuery
        class="mb-4"
        :is-selected="isSelected"
        :query="query"
        :can-search="canSearch"
        :can-export="canExport"
        :is-searching="isSearching"
        :is-exporting="isExporting"
        :experiences-count="experiencesCount"
        :show-export-button="showExportButton"
        :can-user-toggle-view="canUserToggleView"
        @on:update-query="(updatedQuery) => emits('on:updateQuery', updatedQuery)"
        @clear-query="emits('on:clearQuery')"
        @search="emits('search')"
        @export="emits('export')"
        @navigate:toggle="emits('navigate:toggle')"
      >
        <template #chips>
          <AdvancedSearchChips
            :applied-filters="appliedFiltersValues"
            @on:remove-chip="(chip) => emits('on:removeAppliedFilter', chip.source)"
          />
        </template>
      </AdvancedSearchQuery>
      <slot />
    </div>
    <AdvancedSearchFilters
      v-if="hasFilters"
      :most-used-config="filtersConfig.mostUsedFiltersConfig"
      :more-filters-config="filtersConfig.moreFiltersConfig"
      :filters-values="filtersValues"
      :can-apply="canApplyFilters"
      :can-clear="canClearFilters"
      @on:update-filter="(updatedFilter) => emits('on:updateFilter', updatedFilter)"
      @on:clear-all-filters="emits('on:clearAllFilters')"
      @on:apply-filters="emits('on:applyFilters')"
    />
  </div>
</template>

<script setup lang="ts">
import AdvancedSearchQuery from "@/features/advanced-search/components/AdvancedSearchQuery/AdvancedSearchQuery.vue";
import AdvancedSearchFilters from "@/features/advanced-search/components/AdvancedSearchFilters/AdvancedSearchFilters.vue";
import {
  type AdvancedFilterSectionsConfig,
  type AdvancedFilterDateRangeValue,
  type AdvancedFilterMultiselectValue,
  type AdvancedFiltersValues,
} from "../../types/filters";
import AdvancedSearchChips from "../AdvancedSearchChips/AdvancedSearchChips.vue";
import { Option } from "@/types/Option";

export interface Props {
  isSearching: boolean;
  isExporting: boolean;
  query: string;
  canSearch: boolean;
  canExport: boolean;
  isSelected: boolean;
  experiencesCount: number | undefined;
  filtersConfig: AdvancedFilterSectionsConfig;
  filtersValues: AdvancedFiltersValues;
  appliedFiltersValues: AdvancedFiltersValues;
  canApplyFilters: boolean;
  canClearFilters: boolean;
  showExportButton: boolean;
  canUserToggleView: boolean;
}

interface Events {
  (e: "on:updateQuery", updatedQuery: string): void;
  (e: "on:clearQuery"): void;
  (e: "search"): void;
  (e: "export"): void;
  (e: "navigate:toggle"): void;
  (
    e: "on:updateFilter",
    args: { filterKey: string; value: AdvancedFilterDateRangeValue | AdvancedFilterMultiselectValue }
  ): void;
  (
    e: "on:removeAppliedFilter",
    filter: { type: "multiselect"; filterKey: string; option: Option } | { type: "date-range"; filterKey: string }
  ): void;
  (e: "on:clearAllFilters"): void;
  (e: "on:applyFilters"): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Events>();

const hasFilters = computed(() => {
  return props.filtersConfig.mostUsedFiltersConfig.length || props.filtersConfig.moreFiltersConfig.length;
});
</script>

<style lang="scss" scoped>
@import "@/assets/scss/utilities";

.AdvancedSearchView {
  display: flex;
  height: 90vh;

  &__firstColumn {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow-x: hidden;
    width: 100%;
  }
}
</style>

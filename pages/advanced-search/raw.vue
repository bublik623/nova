<template>
  <div class="wrapper">
    <ProductsSidebar />
    <div class="view px-4 py-4 hide-scrollbar">
      <AdvancedSearchView
        class="view"
        :is-selected="false"
        :is-searching="rawSearchStore.isSearching"
        :is-exporting="rawSearchStore.isExporting"
        :query="rawSearchStore.inputQuery"
        :experiences-count="rawSearchStore.totalCount"
        :filters-config="filtersStore.filtersConfig"
        :filters-values="filtersStore.filtersValues"
        :applied-filters-values="filtersStore.appliedFiltersValues"
        :can-search="rawSearchStore.canSearch"
        :can-export="rawSearchStore.canExport"
        :can-apply-filters="filtersStore.canApplyFilters"
        :can-clear-filters="filtersStore.canClearFilters"
        :show-export-button="showExportButton"
        :can-user-toggle-view="canUserToggleView"
        @search="rawSearchStore.startNewSearch"
        @export="handleExport"
        @navigate:toggle="handleNavigate"
        @on:update-query="rawSearchStore.setInputQuery"
        @on:clear-query="rawSearchStore.clearQuery"
        @on:update-filter="(updatedFilter) => filtersStore.setFilter(updatedFilter.filterKey, updatedFilter.value)"
        @on:remove-applied-filter="handleRemoveAppliedFilter"
        @on:apply-filters="filtersStore.applyFilters"
        @on:clear-all-filters="handleClearAllFilters"
      >
        <AdvancedSearchTableRaw
          :supplier-list="masterData.suppliers"
          :items="rawSearchStore.searchResultsPage"
          :pending="rawSearchStore.isSearching"
          :ids-of-selected-experiences="rawSearchStore.idsOfSelectedExperiences"
          :is-experience-selected="rawSearchStore.isExperienceSelected"
          :are-all-selected="rawSearchStore.areAllExperiencesSelected"
          :are-some-selected="rawSearchStore.areSomeExperiencesSelected"
          :active-sort-key="rawSearchStore.sortKey"
          :active-sort-direction="rawSearchStore.sortDirection"
          @on:toggle-all-selection="rawSearchStore.toggleAllExperienceSelection"
          @on:toggle-experience-selection="rawSearchStore.toggleExperienceSelection"
          @update:active-sort-key="rawSearchStore.changeSort"
        >
          <template v-if="!rawSearchStore.isSearching" #pagination>
            <AdvancedSearchPagination
              v-model="rawSearchStore.pageNumber"
              :items-count="rawSearchStore.totalCount"
              :items-per-page="ITEMS_PER_PAGE"
              @update:model-value="rawSearchStore.changePage"
            />
          </template>
        </AdvancedSearchTableRaw>
      </AdvancedSearchView>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProductsSidebar from "@/features/experience-shared/components/ProductsSidebar.vue";
import AdvancedSearchView from "@/features/advanced-search/components/AdvancedSearchView/AdvancedSearchView.vue";
import AdvancedSearchTableRaw from "@/features/advanced-search/components/AdvancedSearchTable/AdvancedSearchTableRaw.vue";
import AdvancedSearchPagination from "@/features/advanced-search/components/AdvancedSearchTable/AdvancedSearchPagination.vue";
import { ITEMS_PER_PAGE } from "@/features/advanced-search/constants/pagination-constants";
import { useMasterData } from "@/stores/master-data";
import { Option } from "@/types/Option";
import { useRawFiltersStore } from "@/features/advanced-search/store/filters/useRawFiltersStore";
import { useRawAdvancedSearchStore } from "@/features/advanced-search/store/search/useRawAdvancedSearchStore";
import { useDownloadFileTrigger } from "@/features/core-shared/composables/useDownloadFileTrigger";
import { useQueryParamBridge } from "@/features/advanced-search/composables/useQueryParamBridge";
import { storeToRefs } from "pinia";
import { useFeatureFlag } from "@/features/experience-shared/composables/useFeatureFlag";
import { useExperienceDashboardView } from "@/features/experience-dashboard/composables/useExperienceDashboardView";

const router = useRouter();
const masterData = useMasterData();
const { triggerBrowserDownload } = useDownloadFileTrigger();
const filtersStore = useRawFiltersStore();
const rawSearchStore = useRawAdvancedSearchStore();
const showExportButton = useFeatureFlag("raw_adv_search_export_enabled");

const rawSearchStoreRefs = storeToRefs(rawSearchStore);

useQueryParamBridge(rawSearchStoreRefs.activeQuery, "query");
useQueryParamBridge(rawSearchStoreRefs.sortKey, "sort-key");
useQueryParamBridge(rawSearchStoreRefs.sortDirection, "sort-direction");
useQueryParamBridge(rawSearchStoreRefs.pageNumber, "page-number", Number, (pageFromUrl) => {
  return !isNaN(pageFromUrl) && pageFromUrl > 0;
});

rawSearchStore.fetchSearchResults();

const { canUserToggleView, shouldHaveRawContent, shouldHaveEditorialContent } = useExperienceDashboardView();

onMounted(async () => {
  if (!shouldHaveRawContent.value && shouldHaveEditorialContent.value) {
    await handleNavigate();
  }
});

function handleRemoveAppliedFilter(
  filter: { type: "multiselect"; filterKey: string; option: Option } | { type: "date-range"; filterKey: string }
) {
  if (filter.type === "date-range") {
    filtersStore.removeFilter(filter.filterKey);
  } else {
    filtersStore.removeFilterOption(filter.filterKey, filter.option);
  }

  filtersStore.applyFilters();
}

function handleClearAllFilters() {
  filtersStore.clearAllFilters();
  filtersStore.applyFilters();
}

async function handleNavigate() {
  await router.push({
    path: "/advanced-search/editorial",
  });
}

async function handleExport() {
  const exportedFile = await rawSearchStore.exportSearchResults();

  if (exportedFile) {
    triggerBrowserDownload(exportedFile);
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  background-color: var(--color-grey-80);
}

.view {
  width: 100%;
  overflow-x: scroll;
}
</style>

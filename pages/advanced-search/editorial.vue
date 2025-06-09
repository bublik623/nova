<template>
  <div class="wrapper">
    <ProductsSidebar />
    <div class="view px-4 py-4 hide-scrollbar">
      <AdvancedSearchView
        class="view"
        :is-selected="true"
        :is-searching="curationSearchStore.isSearching"
        :is-exporting="curationSearchStore.isExporting"
        :query="curationSearchStore.inputQuery"
        :experiences-count="curationSearchStore.totalCount"
        :filters-config="filtersStore.filtersConfig"
        :filters-values="filtersStore.filtersValues"
        :applied-filters-values="filtersStore.appliedFiltersValues"
        :can-search="curationSearchStore.canSearch"
        :can-export="curationSearchStore.canExport"
        :can-apply-filters="filtersStore.canApplyFilters"
        :can-clear-filters="filtersStore.canClearFilters"
        :show-export-button="showExportButton"
        :can-user-toggle-view="canUserToggleView"
        @search="curationSearchStore.startNewSearch"
        @export="handleExport"
        @navigate:toggle="handleNavigate"
        @on:update-query="curationSearchStore.setInputQuery"
        @on:clear-query="curationSearchStore.clearQuery"
        @on:update-filter="(updatedFilter) => filtersStore.setFilter(updatedFilter.filterKey, updatedFilter.value)"
        @on:remove-applied-filter="handleRemoveAppliedFilter"
        @on:apply-filters="filtersStore.applyFilters"
        @on:clear-all-filters="handleClearAllFilters"
      >
        <AdvancedSearchTableCuration
          :supplier-list="masterData.suppliers"
          :items="curationSearchStore.searchResultsPage"
          :pending="curationSearchStore.isSearching"
          :ids-of-selected-experiences="curationSearchStore.idsOfSelectedExperiences"
          :is-experience-selected="curationSearchStore.isExperienceSelected"
          :are-all-selected="curationSearchStore.areAllExperiencesSelected"
          :are-some-selected="curationSearchStore.areSomeExperiencesSelected"
          :visible-languages="languagesFromUserDefinedFilter"
          :active-sort-key="curationSearchStore.sortKey"
          :active-sort-direction="curationSearchStore.sortDirection"
          @on:toggle-all-selection="curationSearchStore.toggleAllExperienceSelection"
          @on:toggle-experience-selection="curationSearchStore.toggleExperienceSelection"
          @update:active-sort-key="curationSearchStore.changeSort"
        >
          <template v-if="!curationSearchStore.isSearching" #pagination>
            <AdvancedSearchPagination
              v-model="curationSearchStore.pageNumber"
              :items-count="curationSearchStore.totalCount"
              :items-per-page="ITEMS_PER_PAGE"
              @update:model-value="curationSearchStore.changePage"
            />
          </template>
        </AdvancedSearchTableCuration>
      </AdvancedSearchView>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdvancedSearchView from "@/features/advanced-search/components/AdvancedSearchView/AdvancedSearchView.vue";
import AdvancedSearchTableCuration from "@/features/advanced-search/components/AdvancedSearchTable/AdvancedSearchTableCuration.vue";
import ProductsSidebar from "@/features/experience-shared/components/ProductsSidebar.vue";
import AdvancedSearchPagination from "@/features/advanced-search/components/AdvancedSearchTable/AdvancedSearchPagination.vue";
import { ITEMS_PER_PAGE } from "@/features/advanced-search/constants/pagination-constants";
import { AdvancedFilterMultiselectValue } from "@/features/advanced-search/types/filters";
import { useMasterData } from "@/stores/master-data";
import { Option } from "@/types/Option";
import { useCurationFiltersStore } from "@/features/advanced-search/store/filters/useCurationFiltersStore";
import { useCurationAdvancedSearchStore } from "@/features/advanced-search/store/search/useCurationAdvancedSearchStore";
import { useDownloadFileTrigger } from "@/features/core-shared/composables/useDownloadFileTrigger";
import { useQueryParamBridge } from "@/features/advanced-search/composables/useQueryParamBridge";
import { storeToRefs } from "pinia";
import { useFeatureFlag } from "@/features/experience-shared/composables/useFeatureFlag";
import { useExperienceDashboardView } from "@/features/experience-dashboard/composables/useExperienceDashboardView";

const router = useRouter();
const masterData = useMasterData();
const filtersStore = useCurationFiltersStore();
const curationSearchStore = useCurationAdvancedSearchStore();
const { triggerBrowserDownload } = useDownloadFileTrigger();
const showExportButton = useFeatureFlag("editorial_adv_search_export_enabled");

const curationSearchStoreRefs = storeToRefs(curationSearchStore);

useQueryParamBridge(curationSearchStoreRefs.activeQuery, "query");
useQueryParamBridge(curationSearchStoreRefs.sortKey, "sort-key");
useQueryParamBridge(curationSearchStoreRefs.sortDirection, "sort-direction");
useQueryParamBridge(curationSearchStoreRefs.pageNumber, "page", Number, (pageFromUrl) => {
  return !isNaN(pageFromUrl) && pageFromUrl > 0;
});

curationSearchStore.fetchSearchResults();

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

const languagesFromUserDefinedFilter = computed(() => {
  const appliedLanguageFilter = filtersStore.appliedFiltersValues.language as AdvancedFilterMultiselectValue;

  // we have to avoid limiting visible languages when the language filter is using the default value
  // otherwise, since the default value is used to filter curation content from the general distribution content
  // no translations would be visible
  if (!appliedLanguageFilter || appliedLanguageFilter.isDefaultValue) {
    return [];
  }

  return appliedLanguageFilter.value.map((filter) => filter.value);
});

const { canUserToggleView, shouldHaveEditorialContent, shouldHaveRawContent } = useExperienceDashboardView();

onMounted(async () => {
  if (!shouldHaveEditorialContent.value && shouldHaveRawContent.value) {
    await handleNavigate();
  }
});
async function handleNavigate() {
  await router.push({
    path: "/advanced-search/raw",
  });
}

async function handleExport() {
  const exportedFile = await curationSearchStore.exportSearchResults();

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

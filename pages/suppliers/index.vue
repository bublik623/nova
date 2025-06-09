<template>
  <div class="wrapper">
    <ProductsSidebar />
    <div class="view px-4 py-4 hide-scrollbar">
      <!-- <AdvancedSearchTableCuration
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
      </AdvancedSearchTableCuration> -->
    </div>
  </div>
</template>

<script setup lang="ts">
// import AdvancedSearchTableCuration from "@/features/advanced-search/components/AdvancedSearchTable/AdvancedSearchTableCuration.vue";
import ProductsSidebar from "@/features/experience-shared/components/ProductsSidebar.vue";
// import AdvancedSearchPagination from "@/features/advanced-search/components/AdvancedSearchTable/AdvancedSearchPagination.vue";
// import { ITEMS_PER_PAGE } from "@/features/advanced-search/constants/pagination-constants";
// import { AdvancedFilterMultiselectValue } from "@/features/advanced-search/types/filters";
// import { useMasterData } from "@/stores/master-data";
import { getActiveSuppliers } from "@/features/supplier-enrollment/api/useSUpplierEnrollmentApi.ts";

// import { useCurationFiltersStore } from "@/features/advanced-search/store/filters/useCurationFiltersStore";
// import { useCurationAdvancedSearchStore } from "@/features/advanced-search/store/search/useCurationAdvancedSearchStore";
// import { useQueryParamBridge } from "@/features/advanced-search/composables/useQueryParamBridge";
// import { storeToRefs } from "pinia";


// const masterData = useMasterData();
// const filtersStore = useCurationFiltersStore();
// const curationSearchStore = useCurationAdvancedSearchStore();

const activeSuppliers = getActiveSuppliers();

console.log("Active suppliers:", activeSuppliers);


// const curationSearchStoreRefs = storeToRefs(curationSearchStore);

// useQueryParamBridge(curationSearchStoreRefs.activeQuery, "query");
// useQueryParamBridge(curationSearchStoreRefs.sortKey, "sort-key");
// useQueryParamBridge(curationSearchStoreRefs.sortDirection, "sort-direction");
// useQueryParamBridge(curationSearchStoreRefs.pageNumber, "page", Number, (pageFromUrl) => {
//   return !isNaN(pageFromUrl) && pageFromUrl > 0;
// });

// curationSearchStore.fetchSearchResults();


// const languagesFromUserDefinedFilter = computed(() => {
//   const appliedLanguageFilter = filtersStore.appliedFiltersValues.language as AdvancedFilterMultiselectValue;

//   // we have to avoid limiting visible languages when the language filter is using the default value
//   // otherwise, since the default value is used to filter curation content from the general distribution content
//   // no translations would be visible
//   if (!appliedLanguageFilter || appliedLanguageFilter.isDefaultValue) {
//     return [];
//   }

//   return appliedLanguageFilter.value.map((filter) => filter.value);
// });
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

import { useNotifications } from "@/stores/notifications";
import { AdvancedFiltersValues } from "../../types/filters";
import { FiltersStore } from "../filters/filtersStoreFactory";
import { ITEMS_PER_PAGE } from "../../constants/pagination-constants";
import { AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";
import { getFileNameFromContentDisposition } from "@/features/core-shared/utils/http/http-utils";
import { useMultiSelection } from "@/features/core-shared/composables/useMultiSelection";
import { SortKey } from "@/types/SortingTypes";

export type SortDirection = "asc" | "desc";

export type File = {
  fileName: string;
  fileContent: Blob;
};

export type SearchResultsProvider<TResultItem> = (
  query: string,
  filters: AdvancedFiltersValues,
  sortKey: SortKey,
  sortDirection: SortDirection,
  offset: number,
  limit: number
) => Promise<{ data: TResultItem[]; headers: RawAxiosResponseHeaders | AxiosResponseHeaders }>;

export type SearchResultsReportProvider = (
  query: string,
  filters: AdvancedFiltersValues,
  sortKey: SortKey,
  sortDirection: SortDirection
) => Promise<{ data: ArrayBuffer; headers: RawAxiosResponseHeaders | AxiosResponseHeaders }>;

export function searchStoreFactory<TResultItem>(
  contentType: string,
  defaultSortKey: SortKey,
  defaultSortDirection: SortDirection,
  useFiltersStore: () => FiltersStore,
  searchResultsProvider: SearchResultsProvider<TResultItem>,
  searchResultsReportProvider: SearchResultsReportProvider
) {
  const notificationsStore = useNotifications();
  const filtersStore = useFiltersStore();
  const {
    selectedItems: idsOfSelectedExperiences,
    areAllSelected: areAllExperiencesSelected,
    areSomeSelected: areSomeExperiencesSelected,
    clearSelection: deselectAllExperiences,
    selectAll: selectAllExperiences,
    isItemSelected: isExperienceSelected,
    toggleItemSelection: toggleExperienceSelection,
    toggleAllSelection: toggleAllExperienceSelection,
  } = useMultiSelection<string>();

  filtersStore.$onAction(({ name, after }) => {
    if (name === "applyFilters") {
      after(reactToAppliedFilters);
    }
  });

  const inputQuery = ref(""); // represent the query in the input
  const activeQuery = ref(""); // represent the last query used for a search
  const sortKey = ref<SortKey>(defaultSortKey);
  const sortDirection = ref<SortDirection>(defaultSortDirection);
  const pageNumber = ref(1);
  const isSearching = ref(false);
  const isExporting = ref(false);
  const searchResultsPage = ref<TResultItem[]>([]) as Ref<TResultItem[]>;
  const totalCount = ref(0);

  const offset = computed(() => ITEMS_PER_PAGE * (pageNumber.value - 1));
  const canSearch = computed(() => inputQuery.value !== activeQuery.value);
  const canExport = computed(
    () => !isSearching.value && inputQuery.value === activeQuery.value && totalCount.value > 0
  );

  /**
   * This watch is used to update the inputQuery when the activeQuery is set at page load with a value from the query param.
   * Without this, the inputQuery would remain empty and there would be a mismatch between the result shown and the query displayed.
   */
  watch(activeQuery, (newActiveQuery) => (inputQuery.value = newActiveQuery));

  /**
   * Update the query from user input.
   * @param newInputQuery the new query
   */
  function setInputQuery(newInputQuery: string) {
    inputQuery.value = newInputQuery;
  }

  /**
   * Fetch the search results and once done updates the searchResultPage and totalCount.
   * Use the following information:
   * - the active query
   * - the applied filters (with default values)
   * - the sort information (key + direction)
   * - the offset from which to start considering the results (calculated from the page and page size)
   */
  async function fetchSearchResults() {
    try {
      isSearching.value = true;
      const response = await searchResultsProvider(
        activeQuery.value,
        filtersStore.appliedFiltersValuesWithDefaults,
        sortKey.value,
        sortDirection.value,
        offset.value,
        ITEMS_PER_PAGE
      );

      totalCount.value = Number(response.headers["total-counts"]);
      searchResultsPage.value = response.data;
    } catch (error) {
      totalCount.value = 0;
      searchResultsPage.value = [];

      console.error(error);

      notificationsStore.addNotification({
        theme: "error",
        message: "notifications.error.fetching.experiences",
      });
    } finally {
      isSearching.value = false;
    }
  }

  /**
   * Perform a new search using the most recent query.
   * Will deselect all selected experiences.
   * Will reset the page to 1, but will keep the sort.
   * Will clear selected experiences.
   */
  async function startNewSearch() {
    deselectAllExperiences();
    activeQuery.value = inputQuery.value;
    pageNumber.value = 1;

    await fetchSearchResults();
  }

  /**
   * Clear the query and then perform a new search.
   */
  async function clearQuery() {
    inputQuery.value = "";

    await startNewSearch();
  }

  /**
   * Update the sort information and then fetch the search results.
   * @param key the key of the property to sort the search results for.
   */
  async function changeSort(key: SortKey) {
    if (sortKey.value === key) {
      toggleSortDirection();
    } else {
      sortKey.value = key;
      sortDirection.value = "asc";
    }

    await fetchSearchResults();
  }

  function toggleSortDirection() {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  }

  /**
   * Update the page and then fetch the search results.
   * @param number the page number
   */
  async function changePage(number: number) {
    pageNumber.value = number;

    await fetchSearchResults();
  }

  /**
   * Fetch and returns the report file with the search results.
   * Use the following information from the store:
   * - the active query
   * - the applied filters (with default values)
   * - the sort information (key + direction)
   */
  async function exportSearchResults() {
    if (!canExport.value) {
      return;
    }

    try {
      isExporting.value = true;
      const response = await searchResultsReportProvider(
        activeQuery.value,
        filtersStore.appliedFiltersValuesWithDefaults,
        sortKey.value,
        sortDirection.value
      );

      const fileName = getFileNameFromContentDisposition(response.headers) ?? `${contentType}-export.xlsx`;

      return {
        fileName,
        fileContent: new Blob([response.data]),
      };
    } finally {
      isExporting.value = false;
    }
  }

  async function reactToAppliedFilters() {
    pageNumber.value = 1;

    await fetchSearchResults();
  }

  return {
    inputQuery,
    activeQuery,
    setInputQuery,
    clearQuery,

    sortKey,
    sortDirection,
    changeSort,

    pageNumber,
    changePage,

    searchResultsPage,
    totalCount,

    canSearch,
    isSearching,
    startNewSearch,
    fetchSearchResults,

    canExport,
    isExporting,
    exportSearchResults,

    idsOfSelectedExperiences,
    areAllExperiencesSelected,
    areSomeExperiencesSelected,
    deselectAllExperiences,
    selectAllExperiences,
    isExperienceSelected,
    toggleExperienceSelection,
    toggleAllExperienceSelection,
  };
}

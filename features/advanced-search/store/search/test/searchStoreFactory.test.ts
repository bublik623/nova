import { vi, beforeEach, describe, expect, test } from "vitest";
import { createPinia, defineStore, setActivePinia } from "pinia";
import { SearchResultsProvider, SearchResultsReportProvider, searchStoreFactory } from "../searchStoreFactory";
import { buildFilterStoreFactory } from "../../filters/filtersStoreFactory";
import { ITEMS_PER_PAGE } from "@/features/advanced-search/constants/pagination-constants";
import { AdvancedFilterDateRangeValue, AdvancedFilterMultiselectValue } from "@/features/advanced-search/types/filters";

type Item = { id: string; name: string };

const searchResultItems: Item[] = [
  { id: "1", name: "first" },
  { id: "2", name: "second" },
];

const useFiltersStore = defineStore(
  "generic filters store",
  buildFilterStoreFactory(() =>
    ref({
      mostUsedFiltersConfig: [],
      moreFiltersConfig: [],
    })
  )
);

const searchResultsProviderMock = vi
  .fn<Parameters<SearchResultsProvider<Item>>, ReturnType<SearchResultsProvider<Item>>>()
  .mockReturnValue(Promise.resolve({ data: searchResultItems, headers: { "total-count": "5" } }));
const searchResultsReportProviderMock = vi.fn<
  Parameters<SearchResultsReportProvider>,
  ReturnType<SearchResultsReportProvider>
>();

const defaultSortDirection = "asc";
const nonDefaultSortDirection = "desc";

function buildStore() {
  const useStore = defineStore("generic advanced search store", () =>
    searchStoreFactory(
      "generic",
      "default-sort-key",
      defaultSortDirection,
      useFiltersStore,
      searchResultsProviderMock,
      searchResultsReportProviderMock
    )
  );

  return useStore();
}

describe("searchStoreFactory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  describe("filter store built with the factory", () => {
    describe("setInputQuery", () => {
      test("it should set the inputQuery state to the given query", () => {
        const store = buildStore();

        expect(store.inputQuery).toEqual("");

        store.setInputQuery("a query");

        expect(store.inputQuery).toEqual("a query");
      });
    });

    describe("clearQuery", () => {
      test("it should set the inputQuery state to an empty string", async () => {
        const store = buildStore();
        store.inputQuery = "a query";

        await store.clearQuery();

        expect(store.inputQuery).toEqual("");
      });

      test("it should set the activeQuery state to an empty string", async () => {
        const store = buildStore();
        store.activeQuery = "a query";

        await store.clearQuery();

        expect(store.activeQuery).toEqual("");
      });

      test("it should fetch data using the empty query", async () => {
        const store = buildStore();
        store.inputQuery = "a query";
        store.activeQuery = "a query";

        await store.clearQuery();

        expect(searchResultsProviderMock).toHaveBeenCalledOnce();
        expect(searchResultsProviderMock).toHaveBeenCalledWith(
          "",
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything()
        );
      });
    });

    describe("changeSort", () => {
      test("it should update the sort key and set default sort direction when the given sort key is different from the previous", async () => {
        const store = buildStore();
        store.sortKey = "a different property key";
        store.sortDirection = nonDefaultSortDirection;

        await store.changeSort("a property key");

        expect(store.sortKey).toBe("a property key");
        expect(store.sortDirection).toBe(defaultSortDirection);
      });

      test("it should toggle the sort direction when the given key is already used to sort", async () => {
        const store = buildStore();
        store.sortKey = "a property key";

        expect(store.sortDirection).toBe(defaultSortDirection);

        await store.changeSort("a property key");

        expect(store.sortDirection).toBe(nonDefaultSortDirection);
      });

      test("it should fetch data with the updated sort information", async () => {
        const store = buildStore();
        store.sortKey = "another property key";
        store.sortDirection = nonDefaultSortDirection;

        await store.changeSort("a property key");

        expect(searchResultsProviderMock).toHaveBeenCalledOnce();
        expect(searchResultsProviderMock).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          "a property key",
          defaultSortDirection,
          expect.anything(),
          expect.anything()
        );
      });
    });

    describe("changePage", () => {
      test("it should set the pageNumber state to the given number", async () => {
        const store = buildStore();

        await store.changePage(3);

        expect(store.pageNumber).toBe(3);
      });

      test("it should fetch data with the updated offset", async () => {
        const page = 3;
        const expectedOffset = ITEMS_PER_PAGE * 2;
        const store = buildStore();

        await store.changePage(page);

        expect(searchResultsProviderMock).toHaveBeenCalledOnce();
        expect(searchResultsProviderMock).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expectedOffset,
          expect.anything()
        );
      });
    });

    describe("startNewSearch", () => {
      test("it should clear selected experiences", async () => {
        const store = buildStore();
        store.idsOfSelectedExperiences = ["id1"];

        expect(store.idsOfSelectedExperiences).toHaveLength(1);

        await store.startNewSearch();

        expect(store.idsOfSelectedExperiences).toHaveLength(0);
      });

      test("it should update the activeQuery with the inputQuery value and fetch", async () => {
        const store = buildStore();
        store.inputQuery = "a query";
        store.activeQuery = "";

        await store.startNewSearch();

        expect(store.activeQuery).toBe(store.inputQuery);
      });

      test("it should reset the page number to 1", async () => {
        const store = buildStore();
        store.pageNumber = 13;

        await store.startNewSearch();

        expect(store.pageNumber).toBe(1);
      });

      test("it should fetch data with the updated query and offset", async () => {
        const expectedQuery = "a query";
        const expectedOffset = 0;

        const store = buildStore();
        store.inputQuery = "a query";
        store.activeQuery = "";

        await store.startNewSearch();

        expect(searchResultsProviderMock).toHaveBeenCalledOnce();
        expect(searchResultsProviderMock).toHaveBeenCalledWith(
          expectedQuery,
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expectedOffset,
          expect.anything()
        );
      });
    });

    describe("when applied filters change", () => {
      test("it should reset the page number to 1", async () => {
        const filtersStore = useFiltersStore();

        const store = buildStore();
        store.pageNumber = 3;

        filtersStore.applyFilters();

        expect(store.pageNumber).toBe(1);
      });

      test("it should not update the active query", () => {
        const filtersStore = useFiltersStore();

        const store = buildStore();
        store.inputQuery = "the input query";
        store.activeQuery = "the active query";

        filtersStore.applyFilters();

        expect(store.activeQuery).toBe("the active query");
      });

      test("it should fetch data with updated filters and offset", () => {
        const expectedQuery = "a query";
        const expectedOffset = 0;
        const expectedFilters: Record<string, AdvancedFilterDateRangeValue | AdvancedFilterMultiselectValue> = {
          filterKey: { type: "multiselect", value: [{ value: "option-1", label: "option 1" }], isDefaultValue: false },
        };

        const filtersStore = useFiltersStore();
        filtersStore.filtersValues = expectedFilters;

        const store = buildStore();
        store.inputQuery = "a different query";
        store.activeQuery = expectedQuery;
        store.pageNumber = 3;

        filtersStore.applyFilters();

        expect(searchResultsProviderMock).toHaveBeenCalledOnce();
        expect(searchResultsProviderMock).toHaveBeenCalledWith(
          expectedQuery,
          expectedFilters,
          expect.anything(),
          expect.anything(),
          expectedOffset,
          expect.anything()
        );
      });
    });
  });
});

import { vi, beforeEach, describe, expect, test } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { mockMasterDataStore } from "@/__mocks__/useMasterData";
import { flushPromises } from "@vue/test-utils";
import { useCurationAdvancedSearchStore } from "../useCurationAdvancedSearchStore";

vi.stubGlobal("useNuxtApp", () => ({
  $t: (s: string) => s,
}));

const contentQueryApiMock = {
  getAllDistributionContentsV2: vi.fn(),
  getAllDistributionContentsReport: vi.fn(),
};

vi.mock("@/composables/useContentQueryApi", () => {
  return {
    useContentQueryApi: () => contentQueryApiMock,
  };
});

mockMasterDataStore();

describe("useCurationAdvancedSearchStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  test("should return an advanced search store", () => {
    const store = useCurationAdvancedSearchStore();

    expect(store).toBeDefined();
  });

  test("it should use getAllDistributionContentsV2 to fetch data", async () => {
    contentQueryApiMock.getAllDistributionContentsV2.mockReturnValueOnce({ data: {}, headers: {} });

    const store = useCurationAdvancedSearchStore();
    store.isSearching = false;
    store.inputQuery = "a new query";
    store.activeQuery = "a new query";
    store.sortKey = "title";
    store.sortDirection = "desc";
    store.pageNumber = 4;

    await store.fetchSearchResults();

    expect(contentQueryApiMock.getAllDistributionContentsV2).toHaveBeenCalledOnce();
    expect(contentQueryApiMock.getAllDistributionContentsV2).toHaveBeenCalledWith({
      offset: 150,
      limit: 50,
      query: "a new query",
      sort: "-experience_content.experience_translation.title",
      pagination: expect.anything(),
      filters: expect.anything(),
    });
  });

  test("it should use getAllDistributionContentsReport to get the report", async () => {
    contentQueryApiMock.getAllDistributionContentsReport.mockReturnValueOnce({ data: {}, headers: {} });
    const store = useCurationAdvancedSearchStore();
    store.isSearching = false;
    store.inputQuery = "a new query";
    store.activeQuery = "a new query";
    store.sortKey = "title";
    store.sortDirection = "desc";
    store.totalCount = 10;

    await flushPromises();

    await store.exportSearchResults();

    expect(contentQueryApiMock.getAllDistributionContentsReport).toHaveBeenCalledOnce();
    expect(contentQueryApiMock.getAllDistributionContentsReport).toHaveBeenCalledWith({
      query: "a new query",
      sort: "-experience_content.experience_translation.title",
      filters: expect.anything(),
      fields: expect.anything(),
    });
  });
});
